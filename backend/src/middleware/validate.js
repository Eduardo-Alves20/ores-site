import { validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Dados inválidos.',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

export function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

// ── Password policy ──────────────────────────────────────────────────────────
// Returns null if password is acceptable, or an error message describing what
// is missing. Policy: min 12 chars, must mix upper/lower/digit, not a top
// common password, not contain the user's email local part.
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', '123456789', 'qwerty123', 'admin123',
  'administrator', 'welcome1', 'iloveyou', 'changeme', 'letmein123',
  'ores@2026', 'ores2026', 'ores@ores', 'oresong', 'admin@ores',
]);

export function validatePasswordStrength(password, { email } = {}) {
  if (typeof password !== 'string') return 'Senha inválida.';
  if (password.length < 12) return 'Senha deve ter no mínimo 12 caracteres.';
  if (password.length > 128) return 'Senha excede o limite de 128 caracteres.';
  if (!/[a-z]/.test(password)) return 'Senha deve conter pelo menos uma letra minúscula.';
  if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula.';
  if (!/[0-9]/.test(password)) return 'Senha deve conter pelo menos um número.';
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return 'Senha muito comum. Escolha outra.';
  if (email) {
    const local = String(email).toLowerCase().split('@')[0];
    if (local && local.length >= 3 && password.toLowerCase().includes(local)) {
      return 'Senha não pode conter o nome de usuário.';
    }
  }
  return null;
}

export function sanitizeRichText(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'a', 'div'],
    allowedAttributes: { a: ['href', 'target'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
