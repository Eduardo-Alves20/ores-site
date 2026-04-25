import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../database/connection.js';
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

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    // Constant-time: always fetch user (prevents email enumeration via timing)
    const user = await queryOne(`SELECT * FROM admin_users WHERE email = ?`, [email.toLowerCase().trim()]);

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
      // Uniform error — don't reveal whether email exists
      return res.status(401).json({ error: 'Credenciais inválidas.' });
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
    if (!oldToken) return res.status(401).json({ error: 'Não autenticado.' });

    const result = await rotateRefreshToken(oldToken, req);
    if (!result) {
      res.clearCookie('refresh_token', { path: '/api/admin' });
      return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
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
    const user = await queryOne(
      `SELECT id, name, email, role, last_login FROM admin_users WHERE id = ?`,
      [req.adminUser.id]
    );
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await queryOne(`SELECT * FROM admin_users WHERE id = ?`, [req.adminUser.id]);

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta.' });

    if (newPassword.length < 8) return res.status(422).json({ error: 'Nova senha deve ter pelo menos 8 caracteres.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [hash, req.adminUser.id]);
    await revokeAllTokens(req.adminUser.id);
    await auditLog(req.adminUser.id, 'CHANGE_PASSWORD', 'admin_users', req.adminUser.id, null, null, req.ip);

    res.clearCookie('refresh_token', { path: '/api/admin' });
    return res.json({ message: 'Senha alterada. Faça login novamente.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
