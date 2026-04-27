export function normalizeMediaUrl(value) {
  if (!value || typeof value !== 'string') return '';
  const url = value.trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return url;
  if (url.startsWith('uploads/')) return `/${url}`;
  return `/${url}`;
}

