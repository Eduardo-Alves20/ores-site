export const PUBLIC_MENU_ITEMS = [
  { key: 'menu_public_home', defaultLabel: 'Home' },
  { key: 'menu_public_parish', defaultLabel: 'Paroquia' },
  { key: 'menu_public_about', defaultLabel: 'Conheca a Paroquia' },
  { key: 'menu_public_priests', defaultLabel: 'Padres e Diaconos' },
  { key: 'menu_public_facilities', defaultLabel: 'Instalacoes' },
  { key: 'menu_public_calendar', defaultLabel: 'Calendario de Eventos' },
  { key: 'menu_public_rooms', defaultLabel: 'Agendamento de Salas' },
  { key: 'menu_public_community', defaultLabel: 'Comunidade' },
  { key: 'menu_public_groups', defaultLabel: 'Grupos de Oracao' },
  { key: 'menu_public_pastorals', defaultLabel: 'Pastorais e Movimentos' },
  { key: 'menu_public_communities', defaultLabel: 'Comunidades (Setores)' },
  { key: 'menu_public_family', defaultLabel: 'Pastoral Familiar' },
  { key: 'menu_public_volunteer', defaultLabel: 'Quero ser Voluntario' },
  { key: 'menu_public_media', defaultLabel: 'Comunicacao' },
  { key: 'menu_public_news', defaultLabel: 'Noticias' },
  { key: 'menu_public_radio', defaultLabel: 'Web Radio' },
  { key: 'menu_public_homilies', defaultLabel: 'Homilias e Reflexoes' },
  { key: 'menu_public_social', defaultLabel: 'Obra Social' },
  { key: 'menu_public_social_about', defaultLabel: 'Conheca a Obra Social' },
  { key: 'menu_public_social_services', defaultLabel: 'Servicos Oferecidos' },
  { key: 'menu_public_social_courses', defaultLabel: 'Cursos Gratuitos' },
  { key: 'menu_public_contact', defaultLabel: 'Contato' },
];

export const ADMIN_MENU_ITEMS = [
  { key: 'menu_admin_dashboard', defaultLabel: 'Dashboard', type: 'item' },
  { key: 'menu_admin_settings', defaultLabel: 'Aparencia e Paginas', type: 'item' },
  { key: 'menu_admin_hero_slides', defaultLabel: 'Carrossel Home', type: 'item' },
  { key: 'menu_admin_divider_content', defaultLabel: 'Conteudo', type: 'divider' },
  { key: 'menu_admin_news', defaultLabel: 'Noticias', type: 'item' },
  { key: 'menu_admin_events', defaultLabel: 'Eventos', type: 'item' },
  { key: 'menu_admin_homilies', defaultLabel: 'Homilias', type: 'item' },
  { key: 'menu_admin_divider_parish', defaultLabel: 'Paroquia', type: 'divider' },
  { key: 'menu_admin_priests', defaultLabel: 'Padres & Diaconos', type: 'item' },
  { key: 'menu_admin_mass', defaultLabel: 'Horarios de Missa', type: 'item' },
  { key: 'menu_admin_facilities', defaultLabel: 'Instalacoes', type: 'item' },
  { key: 'menu_admin_bookings', defaultLabel: 'Agendamentos de Salas', type: 'item' },
  { key: 'menu_admin_divider_community', defaultLabel: 'Comunidade', type: 'divider' },
  { key: 'menu_admin_groups', defaultLabel: 'Grupos de Oracao', type: 'item' },
  { key: 'menu_admin_pastorals', defaultLabel: 'Pastorais', type: 'item' },
  { key: 'menu_admin_communities', defaultLabel: 'Comunidades', type: 'item' },
  { key: 'menu_admin_divider_social', defaultLabel: 'Obra Social', type: 'divider' },
  { key: 'menu_admin_services', defaultLabel: 'Servicos Sociais', type: 'item' },
  { key: 'menu_admin_courses', defaultLabel: 'Cursos', type: 'item' },
  { key: 'menu_admin_divider_system', defaultLabel: 'Sistema', type: 'divider' },
  { key: 'menu_admin_messages', defaultLabel: 'Mensagens', type: 'item' },
  { key: 'menu_admin_users', defaultLabel: 'Usuarios Admin', type: 'item' },
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

