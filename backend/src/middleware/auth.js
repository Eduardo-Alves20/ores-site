import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, queryOne } from '../database/connection.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_me';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
// Matches COOKIE_OPTS.maxAge in authController.js
const REFRESH_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;
// Grace window: if a recently-rotated token comes back within this many
// milliseconds, treat as a network-blip retry rather than token theft.
const ROTATION_GRACE_MS = 60 * 1000;

// ── Token generation ─────────────────────────────────────────────────────────
export function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, jti: uuidv4() },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES, algorithm: 'HS256' }
  );
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── Store refresh token (rotating family) ───────────────────────────────────
export async function storeRefreshToken(userId, token, family, req) {
  const hash = hashToken(token);
  const expires = new Date(Date.now() + REFRESH_EXPIRES_MS);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, hash, family, expires, req.ip, req.get('user-agent')?.substring(0, 500) || null]
  );
}

// ── Rotate refresh token ─────────────────────────────────────────────────────
// Two scenarios produce a "used" token coming back from the client:
//   1. Network/browser blip during the previous rotation: the server already
//      marked the token used and issued a new one, but the response never
//      reached the browser, so the cookie still has the old token. This is
//      the COMMON case and must NOT log the user out.
//   2. Actual token theft: an attacker captured a previous token and is
//      replaying it after the legitimate client already rotated successfully.
//      Here we should burn the whole family.
//
// We disambiguate by time: if the used token was created within
// ROTATION_GRACE_MS, scenario 1 is overwhelmingly likely → forgive it and
// rotate again from the latest active token in the same family.
export async function rotateRefreshToken(oldToken, req) {
  const hash = hashToken(oldToken);

  // Happy path: the token is still active.
  const existing = await queryOne(
    `SELECT * FROM refresh_tokens WHERE token_hash = ? AND used = 0 AND expires_at > NOW()`,
    [hash]
  );

  if (existing) {
    await query(`UPDATE refresh_tokens SET used = 1 WHERE id = ?`, [existing.id]);
    const newToken = generateRefreshToken();
    await storeRefreshToken(existing.user_id, newToken, existing.family, req);
    const user = await queryOne(`SELECT id, email, role FROM admin_users WHERE id = ?`, [existing.user_id]);
    return { user, newToken };
  }

  // Token used (or unknown). Grace path: was it used very recently?
  const recent = await queryOne(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = ? AND used = 1
       AND created_at > (NOW() - INTERVAL ? SECOND)
       AND expires_at > NOW()`,
    [hash, Math.ceil(ROTATION_GRACE_MS / 1000)]
  );

  if (recent) {
    // The previous response likely got lost on the wire. Issue a new active
    // token in the same family and let the client carry on. We do NOT mark
    // any extra tokens used.
    const newToken = generateRefreshToken();
    await storeRefreshToken(recent.user_id, newToken, recent.family, req);
    const user = await queryOne(`SELECT id, email, role FROM admin_users WHERE id = ?`, [recent.user_id]);
    return { user, newToken };
  }

  // Definitive reuse / unknown token: burn the family.
  const stolen = await queryOne(`SELECT family FROM refresh_tokens WHERE token_hash = ?`, [hash]);
  if (stolen) {
    await query(`UPDATE refresh_tokens SET used = 1 WHERE family = ?`, [stolen.family]);
  }
  return null;
}

// ── Revoke all tokens for user ───────────────────────────────────────────────
export async function revokeAllTokens(userId) {
  await query(`UPDATE refresh_tokens SET used = 1 WHERE user_id = ? AND used = 0`, [userId]);
}

// ── Middleware: require valid access token ───────────────────────────────────
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });
    req.adminUser = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// ── Middleware: require super_admin role ─────────────────────────────────────
export function requireSuperAdmin(req, res, next) {
  if (req.adminUser?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso restrito.' });
  }
  next();
}

// ── Account lockout check ────────────────────────────────────────────────────
export async function checkAccountLock(email) {
  const user = await queryOne(`SELECT locked_until, failed_attempts FROM admin_users WHERE email = ?`, [email]);
  if (!user) return false;
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return true;
  }
  return false;
}

export async function recordFailedAttempt(email) {
  const user = await queryOne(`SELECT id, failed_attempts FROM admin_users WHERE email = ?`, [email]);
  if (!user) return;
  const attempts = user.failed_attempts + 1;
  const lockUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
  await query(
    `UPDATE admin_users SET failed_attempts = ?, locked_until = ? WHERE id = ?`,
    [attempts, lockUntil, user.id]
  );
}

export async function resetFailedAttempts(userId) {
  await query(`UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?`, [userId]);
}

// ── Audit log ────────────────────────────────────────────────────────────────
export async function auditLog(adminId, action, tableName, recordId, oldVals, newVals, ip) {
  try {
    await query(
      `INSERT INTO audit_log (admin_id, action, table_name, record_id, old_values, new_values, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adminId, action, tableName, recordId,
        oldVals ? JSON.stringify(oldVals) : null,
        newVals ? JSON.stringify(newVals) : null, ip]
    );
  } catch (_) {}
}
