export function getSiteName(siteInfo = {}) {
  return (siteInfo.site_name || '').trim() || 'ORES';
}

export function getSiteTagline(siteInfo = {}) {
  return (siteInfo.site_tagline || '').trim() || 'Organização de Reintegração e Estímulo à Socialização';
}
