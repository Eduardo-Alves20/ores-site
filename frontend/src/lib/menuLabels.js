const PUBLIC_MENU_DEFAULTS = {
  menu_public_home: 'Home',
  menu_public_parish: 'Paroquia',
  menu_public_about: 'Conheca a Paroquia',
  menu_public_priests: 'Padres e Diaconos',
  menu_public_facilities: 'Instalacoes',
  menu_public_calendar: 'Calendario de Eventos',
  menu_public_rooms: 'Agendamento de Salas',
  menu_public_community: 'Comunidade',
  menu_public_groups: 'Grupos de Oracao',
  menu_public_pastorals: 'Pastorais e Movimentos',
  menu_public_communities: 'Comunidades (Setores)',
  menu_public_family: 'Pastoral Familiar',
  menu_public_volunteer: 'Quero ser Voluntario',
  menu_public_media: 'Comunicacao',
  menu_public_news: 'Noticias',
  menu_public_radio: 'Web Radio',
  menu_public_homilies: 'Homilias e Reflexoes',
  menu_public_social: 'Obra Social',
  menu_public_social_about: 'Conheca a Obra Social',
  menu_public_social_services: 'Servicos Oferecidos',
  menu_public_social_courses: 'Cursos Gratuitos',
  menu_public_contact: 'Contato',
};

const ADMIN_MENU_DEFAULTS = {
  menu_admin_dashboard: 'Dashboard',
  menu_admin_settings: 'Aparencia e Paginas',
  menu_admin_hero_slides: 'Carrossel Home',
  menu_admin_divider_content: 'Conteudo',
  menu_admin_news: 'Noticias',
  menu_admin_events: 'Eventos',
  menu_admin_homilies: 'Homilias',
  menu_admin_divider_parish: 'Paroquia',
  menu_admin_priests: 'Padres & Diaconos',
  menu_admin_mass: 'Horarios de Missa',
  menu_admin_facilities: 'Instalacoes',
  menu_admin_bookings: 'Agendamentos de Salas',
  menu_admin_divider_community: 'Comunidade',
  menu_admin_groups: 'Grupos de Oracao',
  menu_admin_pastorals: 'Pastorais',
  menu_admin_communities: 'Comunidades',
  menu_admin_divider_social: 'Obra Social',
  menu_admin_services: 'Servicos Sociais',
  menu_admin_courses: 'Cursos',
  menu_admin_divider_system: 'Sistema',
  menu_admin_messages: 'Mensagens',
  menu_admin_users: 'Usuarios Admin',
  menu_admin_audit: 'Log de Auditoria',
};

function withFallbacks(settings, defaults) {
  const values = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    values[key] = settings?.[key] || defaultValue;
  }
  return values;
}

export function getPublicMenuLabels(settings = {}) {
  return withFallbacks(settings, PUBLIC_MENU_DEFAULTS);
}

export function getAdminMenuLabels(settings = {}) {
  return withFallbacks(settings, ADMIN_MENU_DEFAULTS);
}

