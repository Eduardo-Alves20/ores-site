import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../database/connection.js';
import { validatePasswordStrength } from '../middleware/validate.js';
import { verifyTotpForUser } from './twofaController.js';
import {
  generateAccessToken, generateRefreshToken, storeRefreshToken,
  rotateRefreshToken, revokeAllTokens,
  checkAccountLock, recordFailedAttempt, resetFailedAttempts,
  auditLog
} from '../middleware/auth.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/admin',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const EMERGENCY_LOGIN_ENABLED = process.env.NODE_ENV !== 'production' && process.env.ADMIN_EMERGENCY_LOGIN !== 'false';
const EMERGENCY_EMAIL = (process.env.ADMIN_EMERGENCY_EMAIL || 'ores@gmail.com').toLowerCase().trim();
const EMERGENCY_PASSWORD = process.env.ADMIN_EMERGENCY_PASSWORD || '1234';
const EMERGENCY_NAME = process.env.ADMIN_EMERGENCY_NAME || 'Administrador ORES';
const EMERGENCY_TOKEN_PREFIX = 'dev_emergency:';

function emergencyUser() {
  return { id: 1, name: EMERGENCY_NAME, email: EMERGENCY_EMAIL, role: 'super_admin' };
}

function isEmergencyRefreshToken(token) {
  return typeof token === 'string' && token.startsWith(EMERGENCY_TOKEN_PREFIX);
}

export async function login(req, res) {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha sao obrigatorios.' });
    }

    const raw = email.toLowerCase().trim();
    const normalizedEmail = raw === 'ores' ? 'admin@ores.org.br' : raw;

    // Emergency login for local/dev environments when DB is unavailable.
    if (EMERGENCY_LOGIN_ENABLED && normalizedEmail === EMERGENCY_EMAIL && password === EMERGENCY_PASSWORD) {
      const user = emergencyUser();
      const accessToken = generateAccessToken(user);
      res.cookie('refresh_token', `${EMERGENCY_TOKEN_PREFIX}${uuidv4()}`, COOKIE_OPTS);
      return res.json({ accessToken, user });
    }

    // Constant-time: always fetch user (prevents email enumeration via timing)
    const user = await queryOne(`SELECT * FROM admin_users WHERE email = ?`, [normalizedEmail]);

    // Account lockout
    if (user && await checkAccountLock(user.email)) {
      await auditLog(user.id, 'LOGIN_LOCKED', null, null, null, null, req.ip);
      return res.status(429).json({ error: 'Conta bloqueada temporariamente. Tente novamente em 30 minutos.' });
    }

    // Constant-time password check (even if user is null, bcrypt compare runs)
    const dummyHash = '$2a$12$invalidhashfortimingnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn';
    const validPassword = await bcrypt.compare(password, user?.password_hash || dummyHash);

    if (!user || !validPassword) {
      if (user) await recordFailedAttempt(user.email);
      // Uniform error: do not reveal whether email exists
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    // ── 2FA gate ───────────────────────────────────────────────────────────
    if (user.totp_enabled) {
      if (!totpCode) {
        // Step 1 succeeded — signal frontend to ask for the 6-digit code
        return res.status(200).json({ requires2fa: true });
      }
      if (!verifyTotpForUser(user, totpCode)) {
        await recordFailedAttempt(user.email);
        await auditLog(user.id, '2FA_FAILED', null, null, null, null, req.ip);
        return res.status(401).json({ error: 'Código 2FA inválido.' });
      }
    }

    await resetFailedAttempts(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const family = uuidv4();

    await storeRefreshToken(user.id, refreshToken, family, req);
    await auditLog(user.id, 'LOGIN_SUCCESS', null, null, null, null, req.ip);

    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);

    return res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function refresh(req, res) {
  try {
    const oldToken = req.cookies?.refresh_token;
    if (!oldToken) return res.status(401).json({ error: 'Nao autenticado.' });

    if (EMERGENCY_LOGIN_ENABLED && isEmergencyRefreshToken(oldToken)) {
      const user = emergencyUser();
      const accessToken = generateAccessToken(user);
      return res.json({ accessToken, user });
    }

    const result = await rotateRefreshToken(oldToken, req);
    if (!result) {
      res.clearCookie('refresh_token', { path: '/api/admin' });
      return res.status(401).json({ error: 'Sessao invalida. Faca login novamente.' });
    }

    const { user, newToken } = result;
    const accessToken = generateAccessToken(user);

    res.cookie('refresh_token', newToken, COOKIE_OPTS);
    return res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function logout(req, res) {
  try {
    const oldToken = req.cookies?.refresh_token;

    if (EMERGENCY_LOGIN_ENABLED && isEmergencyRefreshToken(oldToken)) {
      res.clearCookie('refresh_token', { path: '/api/admin' });
      return res.json({ message: 'Logout realizado com sucesso.' });
    }

    if (oldToken && req.adminUser) {
      await revokeAllTokens(req.adminUser.id);
      await auditLog(req.adminUser.id, 'LOGOUT', null, null, null, null, req.ip);
    }

    res.clearCookie('refresh_token', { path: '/api/admin' });
    return res.json({ message: 'Logout realizado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function me(req, res) {
  try {
    if (EMERGENCY_LOGIN_ENABLED && req.adminUser?.email === EMERGENCY_EMAIL) {
      return res.json(emergencyUser());
    }

    const user = await queryOne(
      `SELECT id, name, email, role, last_login FROM admin_users WHERE id = ?`,
      [req.adminUser.id]
    );

    if (!user) return res.status(404).json({ error: 'Usuario nao encontrado.' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function changePassword(req, res) {
  try {
    if (EMERGENCY_LOGIN_ENABLED && req.adminUser?.email === EMERGENCY_EMAIL) {
      return res.status(403).json({ error: 'Troca de senha indisponivel para login de contingencia.' });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await queryOne(`SELECT * FROM admin_users WHERE id = ?`, [req.adminUser.id]);

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta.' });

    const pwdError = validatePasswordStrength(newPassword, { email: user.email });
    if (pwdError) return res.status(422).json({ error: pwdError });
    if (newPassword === currentPassword) return res.status(422).json({ error: 'Nova senha deve ser diferente da atual.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [hash, req.adminUser.id]);
    await revokeAllTokens(req.adminUser.id);
    await auditLog(req.adminUser.id, 'CHANGE_PASSWORD', 'admin_users', req.adminUser.id, null, null, req.ip);

    res.clearCookie('refresh_token', { path: '/api/admin' });
    return res.json({ message: 'Senha alterada. Faca login novamente.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
