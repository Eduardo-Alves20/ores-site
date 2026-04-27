export function getSiteName(siteInfo = {}) {
  return (siteInfo.site_name || '').trim() || 'Paroquia';
}

export function getSiteShortName(siteInfo = {}) {
  const fullName = getSiteName(siteInfo);
  return fullName.replace(/^par[oó]quia\s+/i, '').trim() || fullName;
}

export function getConhecaLabel(siteInfo = {}) {
  return `Conheca ${getSiteShortName(siteInfo)}`;
}

export function getRadioLabel(siteInfo = {}) {
  return `Web Radio ${getSiteShortName(siteInfo)}`;
}
