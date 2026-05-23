import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { query, queryOne } from '../database/connection.js';
import { auditLog } from '../middleware/auth.js';

// 30-second window, 1-step tolerance (~90s grace)
authenticator.options = { window: 1, step: 30 };

const TOTP_ISSUER = 'ORES Admin';

// Encrypt/decrypt the secret at rest using the JWT_ACCESS_SECRET as key material.
// Stored secrets won't help an attacker who dumps the DB without the env file.
function getEncKey() {
  const material = process.env.JWT_ACCESS_SECRET || 'fallback_change_me';
  return crypto.createHash('sha256').update(material + '|totp').digest();
}

function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptSecret(packed) {
  const buf = Buffer.from(packed, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

// ── Step 1: generate secret + QR code (does NOT activate yet) ────────────────
export async function setup2FA(req, res) {
  try {
    const user = await queryOne('SELECT id, email, totp_enabled FROM admin_users WHERE id = ?', [req.adminUser.id]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (user.totp_enabled) return res.status(400).json({ error: '2FA já está ativo. Desative antes de reconfigurar.' });

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, TOTP_ISSUER, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth, { width: 240, margin: 2 });

    // Persist encrypted but not yet enabled
    await query('UPDATE admin_users SET totp_secret = ? WHERE id = ?', [encryptSecret(secret), user.id]);

    return res.json({
      secret,                 // plaintext — only shown once for manual entry
      otpauth,
      qrCode: qrDataUrl,
    });
  } catch (err) {
    console.error('2FA setup error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Step 2: verify code, activate 2FA ────────────────────────────────────────
export async function enable2FA(req, res) {
  try {
    const { code } = req.body;
    if (!code || !/^\d{6}$/.test(String(code))) {
      return res.status(400).json({ error: 'Código deve ter 6 dígitos.' });
    }

    const user = await queryOne('SELECT id, totp_secret, totp_enabled FROM admin_users WHERE id = ?', [req.adminUser.id]);
    if (!user?.totp_secret) return res.status(400).json({ error: 'Configure o 2FA primeiro.' });
    if (user.totp_enabled) return res.status(400).json({ error: '2FA já está ativo.' });

    const secret = decryptSecret(user.totp_secret);
    if (!authenticator.check(String(code), secret)) {
      return res.status(401).json({ error: 'Código inválido. Tente novamente.' });
    }

    await query('UPDATE admin_users SET totp_enabled = 1 WHERE id = ?', [user.id]);
    await auditLog(user.id, '2FA_ENABLED', 'admin_users', user.id, null, null, req.ip);

    return res.json({ enabled: true });
  } catch (err) {
    console.error('2FA enable error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Disable 2FA (requires current password + valid TOTP) ─────────────────────
export async function disable2FA(req, res) {
  try {
    const { password, code } = req.body;
    const user = await queryOne('SELECT * FROM admin_users WHERE id = ?', [req.adminUser.id]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (!user.totp_enabled) return res.status(400).json({ error: '2FA não está ativo.' });

    const bcrypt = await import('bcryptjs');
    const valid = await bcrypt.default.compare(password || '', user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta.' });

    const secret = decryptSecret(user.totp_secret);
    if (!authenticator.check(String(code || ''), secret)) {
      return res.status(401).json({ error: 'Código 2FA inválido.' });
    }

    await query('UPDATE admin_users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?', [user.id]);
    await auditLog(user.id, '2FA_DISABLED', 'admin_users', user.id, null, null, req.ip);

    return res.json({ enabled: false });
  } catch (err) {
    console.error('2FA disable error:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Status (for the settings UI) ─────────────────────────────────────────────
export async function status2FA(req, res) {
  try {
    const user = await queryOne('SELECT totp_enabled FROM admin_users WHERE id = ?', [req.adminUser.id]);
    return res.json({ enabled: Boolean(user?.totp_enabled) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Helper used by login flow ────────────────────────────────────────────────
export function verifyTotpForUser(user, code) {
  if (!user.totp_secret) return false;
  try {
    const secret = decryptSecret(user.totp_secret);
    return authenticator.check(String(code || ''), secret);
  } catch {
    return false;
  }
}
