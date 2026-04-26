import bcrypt from 'bcryptjs';
import pool, { query } from './connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('Seeding database...');

  // Admin user
  const hash = await bcrypt.hash('Admin@PES2026!', 12);
  await query(`INSERT IGNORE INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    ['Administrador', 'admin@teste.com', hash, 'super_admin']);

  // Site settings
  const settings = [
    ['site_name', 'Paróquia Espírito Santo'],
    ['site_tagline', 'Painel Admin'],
    ['site_logo_url', ''],
    ['site_address', 'Av. Cassiopéia, 461 — Jardim Satélite, São José dos Campos/SP — 12230-011'],
    ['site_email', 'secretaria@paroquiaespiritosanto.com.br'],
    ['site_whatsapp', '(12) 9-9189-4287'],
    ['site_phone', '(12) 3931-2959'],
    ['site_facebook', ''],
    ['site_instagram', ''],
    ['site_youtube', ''],
    ['radio_stream_url', ''],
    ['daily_message', 'Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos darei descanso. (Mt 11,28)'],
    ['secretary_hours', 'Seg–Sex 8h–17h30 | Sáb 8h–12h'],
    ['hero_eyebrow', 'Bem-vindo à'],
    ['hero_title', 'Uma comunidade unida no Espírito Santo'],
    ['hero_subtitle', 'Venha fazer parte desta família de fé. Missas, grupos, pastorais e muito mais para toda a família.'],
    ['hero_image_url', ''],
    ['hero_primary_label', 'Conheça a Paróquia'],
    ['hero_primary_url', '/conheca'],
    ['hero_secondary_label', 'Fale Conosco'],
    ['hero_secondary_url', '/contato'],
    ['home_quick_title', 'O que você está procurando?'],
    ['home_mission_eyebrow', 'Nossa Missão'],
    ['home_mission_title', 'Evangelizar, celebrar e servir com amor'],
    ['home_mission_text', 'A Paróquia Espírito Santo é uma comunidade viva que celebra os sacramentos, promove a formação cristã e serve à sociedade com amor fraterno.'],
    ['home_mission_primary_label', 'Saiba mais'],
    ['home_mission_primary_url', '/conheca'],
    ['home_mission_secondary_label', 'Seja voluntário'],
    ['home_mission_secondary_url', '/voluntario'],
    ['conheca_eyebrow', 'Paróquia'],
    ['conheca_title', 'Conheça a PES'],
    ['conheca_subtitle', 'Tudo sobre a Paróquia Espírito Santo de São José dos Campos.'],
    ['conheca_image_url', ''],
    ['conheca_history_title', 'Nossa História'],
    ['conheca_history_text_1', 'A Paróquia Espírito Santo está localizada no Jardim Satélite, em São José dos Campos/SP. Com décadas de história, a paróquia serve a comunidade com fé, caridade e evangelização.'],
    ['conheca_history_text_2', 'Nossa missão é evangelizar, celebrar os sacramentos e promover o desenvolvimento integral da pessoa humana, à luz do Evangelho e do Magistério da Igreja.'],
    ['voluntario_eyebrow', 'Comunidade'],
    ['voluntario_title', 'Quero ser Voluntário'],
    ['voluntario_subtitle', 'Junte-se a nós! Há muitas formas de servir ao próximo.'],
    ['voluntario_image_url', ''],
    ['voluntario_cta_title', 'Pronto para servir?'],
    ['voluntario_cta_text', 'Entre em contato com a secretaria paroquial ou nos envie uma mensagem. Teremos prazer em apresentar as oportunidades de voluntariado.'],
    ['voluntario_cta_label', 'Entrar em Contato'],
    ['voluntario_cta_url', '/contato'],
    ['obra_social_eyebrow', 'Obra Social'],
    ['obra_social_title', 'Obra Social Notre Dame de Fátima'],
    ['obra_social_subtitle', 'Servindo a comunidade com amor e solidariedade há décadas.'],
    ['obra_social_image_url', ''],
    ['obra_social_mission_title', 'Nossa Missão Social'],
    ['obra_social_mission_text', 'A Obra Social Nossa Senhora de Fátima é o braço assistencial da Paróquia Espírito Santo, oferecendo serviços gratuitos e cursos profissionalizantes para famílias em situação de vulnerabilidade.'],
    ['obra_social_cta_label', 'Seja Voluntário'],
    ['obra_social_cta_url', '/voluntario'],
    ['maps_url', 'https://maps.google.com/?q=Av.+Cassiopeia,+461,+Jardim+Satélite,+São+José+dos+Campos'],
    ['news_image_url', ''],
    ['radio_image_url', ''],
    ['homilies_image_url', ''],
    ['contact_image_url', ''],
    ['priests_image_url', ''],
    ['facilities_image_url', ''],
    ['calendar_image_url', ''],
    ['rooms_image_url', ''],
    ['groups_image_url', ''],
    ['pastorals_image_url', ''],
    ['communities_image_url', ''],
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
        'Uma comunidade unida no Espírito Santo',
        'Venha fazer parte desta família de fé. Missas, grupos, pastorais e muito mais para toda a família.',
        '',
        'Conheça a Paróquia',
        '/conheca',
        'Fale Conosco',
        '/contato',
        6000,
        1,
        1,
      ]
    );
  }

  // Mass schedule
  const days = [
    { name: 'Segunda', short: 'Seg', order: 1, times: [{ t: '07:00', p: 'JMM' }] },
    { name: 'Terça', short: 'Ter', order: 2, times: [{ t: '07:00', p: 'LS' }, { t: '19:30', p: 'RF' }] },
    { name: 'Quarta', short: 'Qua', order: 3, times: [{ t: '07:00', p: 'MVS' }, { t: '19:30', p: 'PC' }] },
    { name: 'Quinta', short: 'Qui', order: 4, times: [{ t: '07:00', p: 'LS' }, { t: '12:15', p: 'MVS' }, { t: '19:30', p: 'MVS' }] },
    { name: 'Sexta', short: 'Sex', order: 5, times: [{ t: '07:00', p: 'MVS' }, { t: '15:00', p: 'RF' }] },
    { name: 'Sábado', short: 'Sáb', order: 6, times: [{ t: '07:00', p: 'MVS' }, { t: '10:00', p: 'RF' }, { t: '19:00', p: 'MVS' }] },
    { name: 'Domingo', short: 'Dom', order: 7, times: [{ t: '07:00', p: 'RF' }, { t: '09:30', p: 'LS' }, { t: '12:00', p: 'LS' }, { t: '17:00', p: 'MVS' }, { t: '19:30', p: 'MVS' }] },
  ];
  for (const d of days) {
    const [res] = await pool.execute(
      `INSERT IGNORE INTO mass_schedule (day_name, day_short, day_order) VALUES (?, ?, ?)`,
      [d.name, d.short, d.order]
    );
    const scheduleId = res.insertId || (await query(`SELECT id FROM mass_schedule WHERE day_order = ?`, [d.order]))[0]?.id;
    if (scheduleId) {
      await query(`DELETE FROM mass_times WHERE schedule_id = ?`, [scheduleId]);
      for (const t of d.times) {
        await query(`INSERT INTO mass_times (schedule_id, time_value, priest_sigla) VALUES (?, ?, ?)`, [scheduleId, t.t, t.p]);
      }
    }
  }

  // Confession schedule
  await query(`DELETE FROM confession_schedule`);
  const confessions = [
    ['Quinta', '09h | 15h', 1],
    ['Sexta', '09h', 2],
    ['Sábado', '09h', 3],
  ];
  for (const [d, t, o] of confessions) {
    await query(`INSERT INTO confession_schedule (day_name, times, display_order) VALUES (?, ?, ?)`, [d, t, o]);
  }

  // Priests
  const priests = [
    { name: 'Pe. Matheus Viana dos Santos', sigla: 'MVS', role: 'Pároco', bio: 'Padre responsável pela administração pastoral da Paróquia Espírito Santo, conduzindo a comunidade com dedicação e espiritualidade.', order: 1 },
    { name: 'Pe. Lucas Rosa da Silva', sigla: 'LS', role: 'Padre Associado', bio: 'Padre associado comprometido com a evangelização e o cuidado pastoral dos fiéis da comunidade.', order: 2 },
    { name: 'Pe. Rogério Felix Machado', sigla: 'RF', role: 'Padre Associado', bio: 'Padre associado dedicado ao serviço sacramental e à animação litúrgica da paróquia.', order: 3 },
    { name: 'Diác. José Mauro Miranda', sigla: 'JMM', role: 'Diácono Permanente', bio: 'Diácono permanente que serve a comunidade com missas, celebrações e acompanhamento espiritual.', order: 4 },
  ];
  for (const p of priests) {
    const [res] = await pool.execute(
      `INSERT IGNORE INTO priests (name, sigla, role, bio, display_order) VALUES (?, ?, ?, ?, ?)`,
      [p.name, p.sigla, p.role, p.bio, p.order]
    );
    if (res.insertId) {
      const masses = { MVS: ['Qua 07h','Qui 12h15','Qui 19h30','Sex 07h','Sáb 07h','Sáb 19h','Dom 17h','Dom 19h30'], LS: ['Ter 07h','Qui 07h','Dom 09h30','Dom 12h'], RF: ['Ter 19h30','Sex 15h','Sáb 10h','Dom 07h'], JMM: ['Seg 07h'] };
      for (const m of (masses[p.sigla] || [])) {
        await query(`INSERT INTO priest_masses (priest_id, mass_label) VALUES (?, ?)`, [res.insertId, m]);
      }
    }
  }

  // Events
  const events = [
    ['Encontro de Legitimação de Casais', '2026-04-25', '14:00', '20:00', 'Espaço Vida', 'Pastoral Familiar', ''],
    ['Encontro do Grupo de Jovens Metanoia', '2026-04-25', '17:00', '18:00', 'Santuário', 'Juventude', ''],
    ['Arraiá dos Vicentinos', '2026-04-25', '18:00', '22:00', 'Sede dos Vicentinos', 'Evento Social', ''],
    ['Terço dos Homens', '2026-04-28', '19:30', null, 'Santuário de Adoração', 'Oração', ''],
    ['Terço das Mulheres', '2026-04-30', '18:30', null, 'Santuário de Adoração', 'Oração', ''],
    ['Reunião do Conselho Pastoral', '2026-05-03', '20:00', null, 'Sala de Reuniões', 'Gestão', ''],
  ];
  for (const [title, date, start, end, local, cat, desc] of events) {
    await query(`INSERT IGNORE INTO events (title, event_date, start_time, end_time, location, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, date, start, end, local, cat, desc]);
  }

  // News
  const news = [
    { title: 'Grupo de Jovens Paráclito é criado na paróquia', slug: 'grupo-jovens-paraclito', category: 'Comunidade', summary: 'Criado em abril de 2026, o Grupo de Jovens Paráclito tem o objetivo de oferecer espiritualidade e formação para jovens a partir de 18 anos.' },
    { title: 'Campanha da Fraternidade 2026 é lançada', slug: 'campanha-fraternidade-2026', category: 'Campanha', summary: 'A Campanha da Fraternidade 2026 foi lançada com tema voltado à solidariedade e ao cuidado com o próximo.' },
    { title: 'Obra Social abre inscrições para cursos gratuitos', slug: 'obra-social-cursos-gratuitos', category: 'Obra Social', summary: 'A Obra Social Nossa Senhora de Fátima abre vagas para cursos profissionalizantes gratuitos.' },
    { title: 'Pastoral do Surdo celebra 34 anos de fundação', slug: 'pastoral-surdo-34-anos', category: 'Pastoral', summary: 'A Pastoral do Surdo da Paróquia Espírito Santo comemora 34 anos desde sua fundação em 1992.' },
    { title: 'Semana Santa 2026: programação completa', slug: 'semana-santa-2026', category: 'Liturgia', summary: 'Confira a programação completa das celebrações da Semana Santa na Paróquia Espírito Santo.' },
    { title: 'Motoclube Ruah realiza ação social no Satélite', slug: 'motoclube-ruah-acao-social', category: 'Ação Social', summary: 'O Motoclube Ruah realizou mais uma ação social distribuindo alimentos e itens de necessidade básica.' },
  ];
  for (const n of news) {
    await query(`INSERT IGNORE INTO news (title, slug, category, summary, published_at) VALUES (?, ?, ?, ?, NOW())`,
      [n.title, n.slug, n.category, n.summary]);
  }

  // Prayer groups
  const groups = [
    ['Grupo de Oração Ágape', 'Segunda-feira', '19h30', 'Salão Paroquial', 'Grupo de renovação carismática com louvor, adoração e partilha da Palavra.', '(12) 98815-1718'],
    ['Grupo de Oração Fonte de Vida', 'Terça-feira', '20h', 'Sala Verde 2', 'Encontros de oração, cura interior e evangelização para jovens e adultos.', '(12) 99230-4112'],
    ['Grupo de Oração Chama de Amor', 'Quarta-feira', '19h30', 'Santuário de Adoração', 'Dedicado à adoração eucarística e à intercessão pelas famílias da comunidade.', '(12) 98538-3773'],
    ['Grupo de Oração Pentecostes', 'Quinta-feira', '20h', 'Salão Paroquial', 'Louvor carismático com foco na ação do Espírito Santo e nos dons espirituais.', '(12) 99718-1300'],
    ['Grupo de Oração Ruah', 'Sexta-feira', '19h30', 'Sala Verde 1', 'Oração contemplativa, lectio divina e formação espiritual para adultos.', '(12) 99216-7307'],
    ['Vigília de Oração', 'Primeira sexta do mês', '23h–02h', 'Igreja Principal', 'Vigília mensal de adoração eucarística com louvor, confissão e intercessão.', '(12) 98126-5135'],
    ['Terço dos Homens', 'Segunda-feira', '19h30', 'Santuário de Adoração', 'Poderoso meio de resgatar homens para a Igreja, fortalecendo famílias cristãs.', '(12) 99787-0047'],
    ['Terço das Mulheres', 'Quarta-feira', '18h30', 'Santuário de Adoração', 'Grupo de mulheres que rezam o Santo Terço pelas famílias e vocações semanalmente.', ''],
    ['Liturgia das Horas', 'Seg a Sex', '07h30', 'Santuário de Adoração', 'Oração comunitária com Laudes, Véspera e Completas — coração da Igreja.', '(12) 98803-6850'],
  ];
  for (let i = 0; i < groups.length; i++) {
    const [name, day, time, loc, desc, phone] = groups[i];
    await query(`INSERT IGNORE INTO prayer_groups (name, day_of_week, time_value, location, description, coordinator_phone, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, day, time, loc, desc, phone, i + 1]);
  }

  // Communities
  const communities = [
    ['Comunidade São Francisco de Assis', 'Vila São Francisco', 'Sergio', '(12) 99718-1300'],
    ['Comunidade Nossa Senhora Aparecida', 'Jardim América', 'Miriam', '(12) 99675-5074'],
    ['Comunidade São José', 'Residencial Aquarius', 'Ricardo', '(12) 99791-3072'],
    ['Comunidade Santa Teresinha', 'Jardim Satélite Centro', 'Angela', '(12) 99779-2685'],
    ['Comunidade Imaculada Conceição', 'Vista Verde', 'Junior', '(12) 98187-4623'],
    ['Comunidade São Pedro e São Paulo', 'Parque Industrial', 'Monica', '(12) 98143-4589'],
    ['Comunidade Espírito Santo', 'Jardim Morumbi', 'Fabiana', '(12) 98101-1207'],
    ['Comunidade Nossa Senhora das Graças', 'Jardim Aquarius Ext.', 'Fabiana', '(12) 98248-1515'],
    ['Comunidade Santo Antônio', 'Parque Residencial Aquarius', 'Igor', '(12) 98805-5752'],
    ['Comunidade São João Batista', 'Eldorado', 'Roberta', '(12) 98877-7816'],
    ['Comunidade Cristo Ressuscitado', 'Bosque dos Ipês', 'Felipe', '(12) 98817-1840'],
  ];
  for (let i = 0; i < communities.length; i++) {
    const [name, bairro, coord, phone] = communities[i];
    await query(`INSERT IGNORE INTO communities (name, neighborhood, coordinator_name, coordinator_phone, display_order) VALUES (?, ?, ?, ?, ?)`,
      [name, bairro, coord, phone, i + 1]);
  }

  // Facilities
  const facilities = [
    ['Igreja Principal', 'Templo principal da paróquia com capacidade para centenas de fiéis, palco das missas e grandes celebrações.', '⛪', 500],
    ['Santuário de Adoração', 'Espaço dedicado à adoração eucarística permanente e grupos de oração durante a semana.', '🕯️', 80],
    ['Espaço Vida', 'Salão multiuso para encontros, retiros, catequese e eventos pastorais.', '🏛️', 150],
    ['Salão Paroquial', 'Amplo salão para eventos comunitários, festividades e reuniões de grande porte.', '🏠', 300],
    ['Sala Verde 1', 'Sala de reunião para grupos menores, pastorais e movimentos da comunidade.', '🌿', 30],
    ['Sala Verde 2', 'Sala de reunião para grupos menores, pastorais e movimentos da comunidade.', '🌿', 30],
    ['Secretaria Paroquial', 'Atendimento ao público de segunda a sexta, 8h–17h30, e sábados 8h–12h.', '📋', null],
    ['Obra Social', 'Instalações dedicadas aos cursos, oficinas e serviços gratuitos à comunidade.', '🤝', null],
  ];
  for (let i = 0; i < facilities.length; i++) {
    const [name, desc, icon, cap] = facilities[i];
    await query(`INSERT IGNORE INTO facilities (name, description, icon, capacity, display_order) VALUES (?, ?, ?, ?, ?)`,
      [name, desc, icon, cap, i + 1]);
  }

  // Social services
  const services = [
    ['Farmácia Comunitária', 'Disponibiliza medicamentos gratuitos ou a preço de custo para famílias carentes cadastradas.', '💊'],
    ['Bazar Beneficente', 'Venda de roupas, calçados e utensílios a preços acessíveis. Renda revertida para a manutenção da Obra Social.', '🛍️'],
    ['Atendimento Social', 'Equipe de assistentes sociais e voluntários para acompanhamento e orientação de famílias em vulnerabilidade.', '👥'],
    ['Empréstimo de Equipamentos Hospitalares', 'Cadeiras de rodas, muletas, camas hospitalares e outros equipamentos disponíveis para empréstimo.', '🏥'],
    ['Parceria com o CRAS/CREAS', 'Articulação com o poder público municipal para encaminhamento de demandas sociais e acesso a benefícios.', '🤝'],
    ['Visitas Domiciliares', 'Voluntários visitam famílias em situação de vulnerabilidade levando assistência material e espiritual.', '🏠'],
  ];
  for (let i = 0; i < services.length; i++) {
    const [title, desc, icon] = services[i];
    await query(`INSERT IGNORE INTO social_services (title, description, icon, display_order) VALUES (?, ?, ?, ?)`,
      [title, desc, icon, i + 1]);
  }

  // Courses
  const courses = [
    ['Informática Básica', '3 meses', 'Seg e Qua, 9h–11h', 20, 'Introdução ao computador, internet, e-mail e ferramentas básicas de escritório.'],
    ['Corte e Costura', '4 meses', 'Ter e Qui, 14h–16h', 15, 'Técnicas de costura para iniciantes, incluindo modelagem e confecção de peças simples.'],
    ['Gastronomia', '2 meses', 'Sex, 9h–12h', 18, 'Culinária básica e confeitaria para geração de renda, com foco em receitas práticas.'],
    ['Artesanato', '3 meses', 'Seg e Qua, 14h–16h', 20, 'Técnicas variadas de artesanato para produção e comercialização de produtos manuais.'],
    ['Cabeleireiro Básico', '4 meses', 'Ter e Qui, 9h–12h', 12, 'Cortes, penteados e técnicas básicas de colorimetria para inserção no mercado de beleza.'],
    ['Inglês Básico', '6 meses', 'Qua e Sex, 14h–16h', 25, 'Inglês comunicativo para iniciantes, com foco em conversação e situações do cotidiano.'],
  ];
  for (let i = 0; i < courses.length; i++) {
    const [name, dur, sched, vac, desc] = courses[i];
    await query(`INSERT IGNORE INTO courses (name, duration, schedule, vacancies, description, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, dur, sched, vac, desc, i + 1]);
  }

  // Homilies
  const homilies = [
    ['O Espírito Santo em nossa vida cotidiana', 'Pe. Matheus Viana dos Santos', 'Homilia', '18 min', '2026-04-20'],
    ['A misericórdia de Deus não tem limites', 'Pe. Lucas Rosa da Silva', 'Reflexão', '22 min', '2026-04-13'],
    ['Domingo de Ramos: entrar em Jerusalém com Jesus', 'Pe. Rogério Felix Machado', 'Homilia', '15 min', '2026-04-06'],
    ['Qual é o fruto da sua oração?', 'Pe. Matheus Viana dos Santos', 'Podcast', '20 min', '2026-03-30'],
    ['A família como escola de amor', 'Diác. José Mauro Miranda', 'Reflexão', '25 min', '2026-03-22'],
    ['Quaresma: tempo de conversão genuína', 'Pe. Lucas Rosa da Silva', 'Homilia', '17 min', '2026-03-15'],
  ];
  for (const [title, priest, type, dur, date] of homilies) {
    await query(`INSERT IGNORE INTO homilies (title, priest_name, type, duration, published_at) VALUES (?, ?, ?, ?, ?)`,
      [title, priest, type, dur, date]);
  }

  console.log('Seed completed.');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
