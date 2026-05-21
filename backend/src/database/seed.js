import bcrypt from 'bcryptjs';
import pool, { query } from './connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('Seeding database...');

  // Admin user
  const hash = await bcrypt.hash('1234', 12);
  await query(
    `INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role)`,
    ['Administrador ORES', 'ores@gmail.com', hash, 'super_admin']
  );

  // Site settings
  const settings = [
    ['site_name', 'ORES'],
    ['site_tagline', 'Organização de Reintegração e Estímulo à Socialização'],
    ['site_logo_url', ''],
    ['site_address', 'Rio de Janeiro — RJ'],
    ['site_email', 'contato@ores.org.br'],
    ['site_whatsapp', ''],
    ['site_phone', ''],
    ['site_facebook', ''],
    ['site_instagram', ''],
    ['site_youtube', ''],
    ['secretary_hours', 'Seg–Sex 9h–17h'],
    ['maps_url', ''],
    ['hero_eyebrow', 'Bem-vindo à'],
    ['hero_title', 'Transformando vidas através da reintegração social'],
    ['hero_subtitle', 'A ORES atua há anos promovendo a reintegração, o estímulo à socialização e o desenvolvimento humano de pessoas em situação de vulnerabilidade.'],
    ['hero_image_url', ''],
    ['hero_primary_label', 'Conheça a ORES'],
    ['hero_primary_url', '/quem-somos'],
    ['hero_secondary_label', 'Fale Conosco'],
    ['hero_secondary_url', '/contato'],
    ['home_quick_title', 'O que a ORES oferece?'],
    ['home_mission_eyebrow', 'Nossa Missão'],
    ['home_mission_title', 'Reintegrar, estimular e transformar'],
    ['home_mission_text', 'A ORES é uma organização sem fins lucrativos dedicada à reintegração social de pessoas em situação de vulnerabilidade, oferecendo programas, cursos e acolhimento humano com dignidade e respeito.'],
    ['home_mission_primary_label', 'Saiba mais'],
    ['home_mission_primary_url', '/quem-somos'],
    ['home_mission_secondary_label', 'Seja voluntário'],
    ['home_mission_secondary_url', '/voluntario'],
    ['donation_enabled', '1'],
    ['donation_eyebrow', 'Apoie nossa causa'],
    ['donation_title', 'Sua doação transforma vidas'],
    ['donation_text', 'Com o seu apoio, conseguimos manter nossos programas sociais, cursos profissionalizantes e ações de reintegração. Cada contribuição faz diferença na vida de quem mais precisa.'],
    ['donation_pix_key', ''],
    ['donation_background_url', ''],
    ['donation_qr_url', ''],
    ['donation_button_label', 'Copiar chave Pix'],
    ['donation_gallery_1_url', ''],
    ['donation_gallery_1_caption', 'Programas de reintegração e acolhimento'],
    ['donation_gallery_2_url', ''],
    ['donation_gallery_2_caption', 'Cursos e capacitação profissional'],
    ['donation_gallery_3_url', ''],
    ['donation_gallery_3_caption', 'Ações sociais e atendimento às famílias'],
    ['quem_somos_eyebrow', 'Sobre a ORES'],
    ['quem_somos_title', 'Quem Somos'],
    ['quem_somos_subtitle', 'Conheça nossa história, missão e valores.'],
    ['quem_somos_image_url', ''],
    ['quem_somos_history_title', 'Nossa História'],
    ['quem_somos_history_text_1', 'A ORES — Organização de Reintegração e Estímulo à Socialização — é uma entidade sem fins lucrativos que nasceu da necessidade de oferecer suporte e acolhimento a pessoas em situação de vulnerabilidade social.'],
    ['quem_somos_history_text_2', 'Com unidades em diferentes regiões do Rio de Janeiro, a ORES desenvolve projetos, programas e cursos que promovem a dignidade humana, a autonomia e a reinserção social.'],
    ['voluntario_eyebrow', 'Voluntariado'],
    ['voluntario_title', 'Quero ser Voluntário'],
    ['voluntario_subtitle', 'Junte-se a nós! Há muitas formas de contribuir com a transformação social.'],
    ['voluntario_image_url', ''],
    ['voluntario_cta_title', 'Pronto para fazer a diferença?'],
    ['voluntario_cta_text', 'Entre em contato com nossa equipe ou nos envie uma mensagem. Teremos prazer em apresentar as oportunidades de voluntariado disponíveis em sua região.'],
    ['voluntario_cta_label', 'Entrar em Contato'],
    ['voluntario_cta_url', '/contato'],
    ['obra_social_eyebrow', 'Programas'],
    ['obra_social_title', 'Programas Sociais da ORES'],
    ['obra_social_subtitle', 'Serviços e programas para reintegração e desenvolvimento social.'],
    ['obra_social_image_url', ''],
    ['obra_social_mission_title', 'Nossa Atuação Social'],
    ['obra_social_mission_text', 'A ORES oferece uma série de programas e serviços voltados ao atendimento de pessoas em situação de vulnerabilidade, promovendo sua reintegração à sociedade com dignidade e autonomia.'],
    ['obra_social_cta_label', 'Seja Voluntário'],
    ['obra_social_cta_url', '/voluntario'],
    ['regionais_eyebrow', 'Nossa Presença'],
    ['regionais_title', 'Unidades Regionais'],
    ['regionais_subtitle', 'A ORES está presente em diferentes regiões do Rio de Janeiro, levando apoio e transformação a quem mais precisa.'],
    ['regionais_image_url', ''],
    ['projetos_eyebrow', 'Iniciativas'],
    ['projetos_title', 'Nossos Projetos'],
    ['projetos_subtitle', 'Conheça os projetos e iniciativas que desenvolvemos para transformar realidades.'],
    ['projetos_image_url', ''],
    ['espaco_ores_eyebrow', 'Espaço ORES'],
    ['espaco_ores_title', 'Espaço ORES'],
    ['espaco_ores_subtitle', 'Conheça nossos espaços de atendimento e convivência.'],
    ['espaco_ores_image_url', ''],
    ['news_image_url', ''],
    ['contact_image_url', ''],
    ['calendar_image_url', ''],
    ['programs_image_url', ''],
    ['courses_image_url', ''],
    ['projects_image_url', ''],
    ['regionais_page_image_url', ''],
  ];
  for (const [k, v] of settings) {
    await query(`INSERT INTO site_settings (\`key\`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)`, [k, v]);
  }

  const [{ n: slideCount }] = await query(`SELECT COUNT(*) AS n FROM hero_slides`);
  if (slideCount === 0) {
    await query(
      `INSERT INTO hero_slides (eyebrow, title, subtitle, image_url, primary_label, primary_url, secondary_label, secondary_url, duration_ms, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Bem-vindo à',
        'Transformando vidas através da reintegração social',
        'A ORES atua promovendo a reintegração, o estímulo à socialização e o desenvolvimento humano de pessoas em situação de vulnerabilidade.',
        '',
        'Conheça a ORES',
        '/quem-somos',
        'Fale Conosco',
        '/contato',
        6000,
        1,
        1,
      ]
    );
  }

  // Regional Units
  const [{ n: regionalCount }] = await query(`SELECT COUNT(*) AS n FROM regional_units`);
  if (regionalCount === 0) {
    const units = [
      ['ORES Rio de Janeiro', 'Rio de Janeiro', 'RJ', '', '', 'rj@ores.org.br', '', 'Unidade sede da ORES, localizada na cidade do Rio de Janeiro. Oferece todos os programas e serviços da organização.', '', '', 1],
      ['ORES Petrópolis', 'Petrópolis', 'RJ', '', '', 'petropolis@ores.org.br', '', 'Unidade da ORES em Petrópolis, com programas de reintegração e o Projeto Educa+.', '', '', 2],
      ['ORES Região dos Lagos', 'Região dos Lagos', 'RJ', '', '', 'lagos@ores.org.br', '', 'Unidade da ORES na Região dos Lagos, levando suporte e oportunidades às comunidades locais.', '', '', 3],
    ];
    for (const [name, city, state, address, phone, email, coordinator, description, image_url, maps_url, display_order] of units) {
      await query(
        `INSERT INTO regional_units (name, city, state, address, phone, email, coordinator, description, image_url, maps_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, city, state, address, phone, email, coordinator, description, image_url, maps_url, display_order]
      );
    }
  }

  // Events
  const [{ n: eventCount }] = await query(`SELECT COUNT(*) AS n FROM events`);
  if (eventCount === 0) {
    const events = [
      ['Oficina de Capacitação Profissional', '2026-05-20', '09:00', '12:00', 'ORES Rio de Janeiro', 'Capacitação', 'Oficina gratuita de capacitação para inserção no mercado de trabalho.'],
      ['Encontro de Voluntários', '2026-05-24', '14:00', '17:00', 'ORES Petrópolis', 'Voluntariado', 'Encontro trimestral de voluntários da ORES Petrópolis.'],
      ['Dia da Família ORES', '2026-06-07', '10:00', '16:00', 'ORES Região dos Lagos', 'Evento Social', 'Evento comemorativo com atividades para toda a família.'],
      ['Palestra: Saúde Mental e Reintegração', '2026-06-14', '18:00', '20:00', 'ORES Rio de Janeiro', 'Saúde', 'Palestra aberta sobre saúde mental no processo de reintegração social.'],
      ['Formatura do Projeto Educa+', '2026-06-28', '16:00', '19:00', 'ORES Petrópolis', 'Educação', 'Cerimônia de formatura dos participantes do Projeto Educa+ em Petrópolis.'],
    ];
    for (const [title, date, start, end, local, cat, desc] of events) {
      await query(`INSERT IGNORE INTO events (title, event_date, start_time, end_time, location, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, date, start, end, local, cat, desc]);
    }
  }

  // News
  const [{ n: newsCount }] = await query(`SELECT COUNT(*) AS n FROM news`);
  if (newsCount === 0) {
    const news = [
      { title: 'Projeto Educa+ inicia nova turma em Petrópolis', slug: 'projeto-educa-nova-turma-petropolis', category: 'Educação', summary: 'O Projeto Educa+ da ORES Petrópolis abre inscrições para nova turma de capacitação educacional.' },
      { title: 'ORES Região dos Lagos realiza ação social na comunidade', slug: 'acao-social-regiao-dos-lagos', category: 'Ação Social', summary: 'A unidade da Região dos Lagos levou atendimento e recursos para famílias em situação de vulnerabilidade.' },
      { title: 'Nova parceria amplia atendimento da ORES Rio de Janeiro', slug: 'nova-parceria-ores-rio', category: 'Institucional', summary: 'A ORES firmou nova parceria para ampliar o alcance dos seus programas de reintegração na capital.' },
      { title: 'ORES abre vagas para voluntários em todas as unidades', slug: 'vagas-voluntarios-ores', category: 'Voluntariado', summary: 'A organização está recrutando voluntários para atuar nos programas sociais, cursos e atendimento às famílias.' },
      { title: 'Capacitação profissional beneficia dezenas de famílias', slug: 'capacitacao-profissional-familias', category: 'Capacitação', summary: 'Cursos de capacitação promovidos pela ORES ajudam participantes a ingressar no mercado de trabalho.' },
      { title: 'ORES celebra aniversário com evento aberto à comunidade', slug: 'aniversario-ores-evento', category: 'Institucional', summary: 'Em comemoração ao aniversário da organização, a ORES realiza evento aberto com atividades para toda a família.' },
    ];
    for (const n of news) {
      await query(`INSERT IGNORE INTO news (title, slug, category, summary, published_at) VALUES (?, ?, ?, ?, NOW())`,
        [n.title, n.slug, n.category, n.summary]);
    }
  }

  // Projects (pastorals table)
  const [{ n: projetoCount }] = await query(`SELECT COUNT(*) AS n FROM pastorals`);
  if (projetoCount === 0) {
    const projects = [
      ['Projeto Educa+', 'Educação', 'Programa de apoio educacional voltado para jovens e adultos que buscam concluir os estudos e ampliar suas oportunidades profissionais.', '', '', '', '', 'ORES Petrópolis', 'Petrópolis - RJ', '', '', 1],
      ['Espaço ORES', 'Social', 'Espaço de convivência e acolhimento para pessoas em processo de reintegração social, oferecendo suporte, atividades e orientação.', '', '', '', '', 'ORES Rio de Janeiro', 'Rio de Janeiro - RJ', '', '', 2],
      ['Programa de Capacitação Profissional', 'Trabalho', 'Cursos e oficinas voltados para a inserção ou reinserção no mercado de trabalho, com foco em habilidades práticas e demandadas pelo mercado.', '', '', '', '', 'Todas as unidades', '', '', '', 3],
      ['Programa de Saúde e Bem-estar', 'Saúde', 'Ações de promoção à saúde física e mental, incluindo atendimentos, palestras e grupos de apoio para os assistidos e suas famílias.', '', '', '', '', 'ORES Rio de Janeiro', 'Rio de Janeiro - RJ', '', '', 4],
    ];
    for (const [name, category, description, coordinator, phone, meeting_day, meeting_time, location, address, map_url, image_url, display_order] of projects) {
      await query(
        `INSERT IGNORE INTO pastorals (name, category, description, coordinator, phone, meeting_day, meeting_time, location, address, map_url, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, coordinator, phone, meeting_day, meeting_time, location, address, map_url, image_url, display_order]
      );
    }
  }

  // Facilities (Espaço ORES)
  const [{ n: facilityCount }] = await query(`SELECT COUNT(*) AS n FROM facilities`);
  if (facilityCount === 0) {
    const facilities = [
      ['Salão de Atividades', 'Espaço multiuso para oficinas, cursos, reuniões e eventos comunitários.', '🏛️', 80],
      ['Sala de Atendimento', 'Sala reservada para atendimento social individualizado e orientações.', '💬', 10],
      ['Biblioteca Comunitária', 'Acervo de livros e materiais didáticos disponíveis para a comunidade.', '📚', 20],
      ['Espaço de Convivência', 'Área de convivência para socialização e atividades recreativas.', '🌿', 50],
    ];
    for (let i = 0; i < facilities.length; i++) {
      const [name, desc, icon, cap] = facilities[i];
      await query(`INSERT IGNORE INTO facilities (name, description, icon, capacity, display_order) VALUES (?, ?, ?, ?, ?)`,
        [name, desc, icon, cap, i + 1]);
    }
  }

  // Social services/programs
  const [{ n: serviceCount }] = await query(`SELECT COUNT(*) AS n FROM social_services`);
  if (serviceCount === 0) {
    const services = [
      ['Atendimento Social', 'Equipe de assistentes sociais para acompanhamento, orientação e encaminhamento de famílias em situação de vulnerabilidade.', '👥'],
      ['Apoio Psicológico', 'Sessões de apoio psicológico individuais e em grupo para pessoas em processo de reintegração social.', '🧠'],
      ['Cesta Básica', 'Distribuição de cestas básicas para famílias cadastradas em situação de insegurança alimentar.', '🛒'],
      ['Encaminhamento ao Mercado de Trabalho', 'Orientação e apoio para inserção ou reinserção profissional, incluindo elaboração de currículo e preparo para entrevistas.', '💼'],
      ['Documentação e Cidadania', 'Auxílio para obtenção de documentos e acesso a direitos e benefícios sociais.', '📋'],
      ['Acompanhamento Familiar', 'Visitas e suporte contínuo para famílias em situação de risco ou vulnerabilidade social.', '🏠'],
    ];
    for (let i = 0; i < services.length; i++) {
      const [title, desc, icon] = services[i];
      await query(`INSERT IGNORE INTO social_services (title, description, icon, display_order) VALUES (?, ?, ?, ?)`,
        [title, desc, icon, i + 1]);
    }
  }

  // Courses
  const [{ n: courseCount }] = await query(`SELECT COUNT(*) AS n FROM courses`);
  if (courseCount === 0) {
    const courses = [
      ['Informática Básica', '3 meses', 'Seg e Qua, 9h–11h', 20, 'Introdução ao computador, internet e ferramentas básicas de escritório para o mercado de trabalho.'],
      ['Corte e Costura', '4 meses', 'Ter e Qui, 14h–16h', 15, 'Técnicas de costura para iniciantes, com foco na geração de renda e inserção profissional.'],
      ['Gastronomia e Confeitaria', '2 meses', 'Sex, 9h–12h', 18, 'Culinária básica e confeitaria para geração de renda, com receitas práticas e técnicas do mercado.'],
      ['Artesanato e Produção Manual', '3 meses', 'Seg e Qua, 14h–16h', 20, 'Técnicas de artesanato para produção e comercialização, incentivando o empreendedorismo.'],
      ['Auxiliar Administrativo', '4 meses', 'Ter e Qui, 9h–12h', 25, 'Formação em rotinas administrativas, atendimento ao público e ferramentas de escritório.'],
      ['Língua Portuguesa e Matemática', '6 meses', 'Qua e Sex, 14h–16h', 20, 'Preparação para o mercado de trabalho e para o ENCCEJA, focando em leitura, escrita e raciocínio lógico.'],
    ];
    for (let i = 0; i < courses.length; i++) {
      const [name, dur, sched, vac, desc] = courses[i];
      await query(`INSERT IGNORE INTO courses (name, duration, schedule, vacancies, description, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, dur, sched, vac, desc, i + 1]);
    }
  }

  console.log('Seed completed.');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
