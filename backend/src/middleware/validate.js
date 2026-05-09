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

export function sanitizeRichText(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'a', 'div'],
    allowedAttributes: { a: ['href', 'target'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
