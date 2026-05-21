export const PUBLIC_MENU_ITEMS = [
  { key: 'menu_public_home', defaultLabel: 'Início' },
  { key: 'menu_public_sobre', defaultLabel: 'A ORES' },
  { key: 'menu_public_quem_somos', defaultLabel: 'Quem Somos' },
  { key: 'menu_public_regionais', defaultLabel: 'Unidades Regionais' },
  { key: 'menu_public_voluntario', defaultLabel: 'Voluntariado' },
  { key: 'menu_public_projetos', defaultLabel: 'Projetos' },
  { key: 'menu_public_espaco', defaultLabel: 'Espaço ORES' },
  { key: 'menu_public_programas', defaultLabel: 'Programas' },
  { key: 'menu_public_programas_sobre', defaultLabel: 'Programas Sociais' },
  { key: 'menu_public_programas_cursos', defaultLabel: 'Cursos' },
  { key: 'menu_public_noticias', defaultLabel: 'Notícias' },
  { key: 'menu_public_eventos', defaultLabel: 'Eventos' },
  { key: 'menu_public_contato', defaultLabel: 'Contato' },
];

export const ADMIN_MENU_ITEMS = [
  { key: 'menu_admin_dashboard', defaultLabel: 'Dashboard', type: 'item' },
  { key: 'menu_admin_settings', defaultLabel: 'Configurações', type: 'item' },
  { key: 'menu_admin_hero_slides', defaultLabel: 'Carrossel Home', type: 'item' },
  { key: 'menu_admin_divider_conteudo', defaultLabel: 'Conteúdo', type: 'divider' },
  { key: 'menu_admin_news', defaultLabel: 'Notícias', type: 'item' },
  { key: 'menu_admin_events', defaultLabel: 'Eventos', type: 'item' },
  { key: 'menu_admin_divider_ong', defaultLabel: 'A ORES', type: 'divider' },
  { key: 'menu_admin_regionais', defaultLabel: 'Unidades Regionais', type: 'item' },
  { key: 'menu_admin_projetos', defaultLabel: 'Projetos', type: 'item' },
  { key: 'menu_admin_espaco', defaultLabel: 'Espaço ORES', type: 'item' },
  { key: 'menu_admin_divider_programas', defaultLabel: 'Programas', type: 'divider' },
  { key: 'menu_admin_services', defaultLabel: 'Programas Sociais', type: 'item' },
  { key: 'menu_admin_courses', defaultLabel: 'Cursos', type: 'item' },
  { key: 'menu_admin_divider_system', defaultLabel: 'Sistema', type: 'divider' },
  { key: 'menu_admin_messages', defaultLabel: 'Mensagens', type: 'item' },
  { key: 'menu_admin_users', defaultLabel: 'Usuários Admin', type: 'item' },
  { key: 'menu_admin_audit', defaultLabel: 'Log de Auditoria', type: 'item' },
];

export function enabledKey(key) {
  return `${key}_enabled`;
}

function isEnabled(settings, key) {
  return settings?.[enabledKey(key)] !== '0';
}

function asLabels(settings, items) {
  const out = {};
  for (const item of items) {
    out[item.key] = settings?.[item.key] || item.defaultLabel;
    out[enabledKey(item.key)] = isEnabled(settings, item.key);
  }
  return out;
}

export function getPublicMenuLabels(settings = {}) {
  return asLabels(settings, PUBLIC_MENU_ITEMS);
}

export function getAdminMenuLabels(settings = {}) {
  return asLabels(settings, ADMIN_MENU_ITEMS);
}
