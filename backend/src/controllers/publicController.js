import { query, queryOne } from '../database/connection.js';

async function safeQuery(sql, params = [], fallback = []) {
  try {
    return await query(sql, params);
  } catch (err) {
    console.error('safeQuery failed:', err?.message || err);
    return fallback;
  }
}

async function queryNewsList(limit = 20) {
  const safeLimit = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 20));

  try {
    return await query(
      `SELECT id, title, slug, category, summary, image_url, external_url, published_at
       FROM news WHERE published = 1 ORDER BY published_at DESC LIMIT ${safeLimit}`
    );
  } catch (err) {
    if (err?.code === 'ER_BAD_FIELD_ERROR') {
      const rows = await safeQuery(
        `SELECT id, title, slug, category, summary, image_url, published_at
         FROM news WHERE published = 1 ORDER BY published_at DESC LIMIT ${safeLimit}`,
        [],
        []
      );
      return rows.map((r) => ({ ...r, external_url: null }));
    }

    console.error('queryNewsList failed:', err?.message || err);
    return [];
  }
}

export async function getHomeData(_req, res) {
  const settingsRows = await safeQuery(`SELECT \`key\`, value FROM site_settings`);
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const events = await safeQuery(
    `SELECT id, title, event_date, start_time, end_time, location, category
     FROM events WHERE active = 1 AND event_date >= CURDATE()
     ORDER BY event_date, start_time LIMIT 6`
  );

  const news = await queryNewsList(3);

  const heroSlides = await safeQuery(
    `SELECT id, eyebrow, title, subtitle, image_url, primary_label, primary_url,
            secondary_label, secondary_url, duration_ms, display_order
     FROM hero_slides WHERE active = 1 ORDER BY display_order, id`
  );

  const regionais = await safeQuery(
    `SELECT id, name, city, state, image_url, description
     FROM regional_units WHERE active = 1 ORDER BY display_order LIMIT 3`
  );

  return res.json({ settings, heroSlides, events, news, regionais });
}

export async function getSiteInfo(_req, res) {
  const rows = await safeQuery(`SELECT \`key\`, value FROM site_settings`);
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return res.json(settings);
}

export async function getHeroSlides(_req, res) {
  const rows = await safeQuery(
    `SELECT id, eyebrow, title, subtitle, image_url, primary_label, primary_url,
            secondary_label, secondary_url, duration_ms, display_order
     FROM hero_slides WHERE active = 1 ORDER BY display_order, id`
  );
  return res.json(rows);
}

export async function getEvents(_req, res) {
  const events = await safeQuery(
    `SELECT id, title, event_date, start_time, end_time, location, category, description
     FROM events WHERE active = 1 ORDER BY event_date, start_time`
  );
  return res.json(events);
}

export async function getNews(_req, res) {
  return res.json(await queryNewsList(20));
}

export async function getNewsItem(req, res) {
  try {
    const item = await queryOne(`SELECT * FROM news WHERE slug = ? AND published = 1`, [req.params.slug]);
    if (!item) return res.status(404).json({ error: 'Noticia nao encontrada.' });
    return res.json(item);
  } catch {
    return res.status(404).json({ error: 'Noticia nao encontrada.' });
  }
}

export async function getProjetos(_req, res) {
  const projetos = await safeQuery(`SELECT * FROM pastorals WHERE active = 1 ORDER BY category, display_order`);
  return res.json(projetos);
}

export async function getProjetoSlides(_req, res) {
  const slides = await safeQuery(
    `SELECT id, title, subtitle, image_url, display_order
     FROM pastoral_slides WHERE active = 1 ORDER BY display_order, id`
  );
  return res.json(slides);
}

export async function getProgramSlides(_req, res) {
  const slides = await safeQuery(
    `SELECT id, title, subtitle, image_url, display_order
     FROM program_slides WHERE active = 1 ORDER BY display_order, id`
  );
  return res.json(slides);
}

export async function getMusic(_req, res) {
  // Pull music-related settings inline so the player only needs one request.
  const settingRows = await safeQuery(
    `SELECT \`key\`, value FROM site_settings
     WHERE \`key\` IN ('music_enabled', 'music_default_volume', 'music_autoplay')`
  );
  const settings = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));
  const tracks = await safeQuery(
    `SELECT id, title, file_url, display_order
     FROM music_tracks WHERE active = 1 ORDER BY display_order, id`
  );
  return res.json({
    enabled: settings.music_enabled === '1',
    autoplay: settings.music_autoplay !== '0', // default true
    defaultVolume: Math.max(0, Math.min(100, Number(settings.music_default_volume) || 35)),
    tracks,
  });
}

export async function getRegionais(_req, res) {
  const regionais = await safeQuery(`SELECT * FROM regional_units WHERE active = 1 ORDER BY display_order`);
  return res.json(regionais);
}

export async function getFacilities(_req, res) {
  const facilities = await safeQuery(`SELECT * FROM facilities WHERE active = 1 ORDER BY display_order`);
  return res.json(facilities);
}

export async function getSocialServices(_req, res) {
  const services = await safeQuery(`SELECT * FROM social_services WHERE active = 1 ORDER BY display_order`);
  const courses = await safeQuery(`SELECT * FROM courses WHERE active = 1 ORDER BY display_order`);
  return res.json({ services, courses });
}

export async function getCourses(_req, res) {
  const courses = await safeQuery(`SELECT * FROM courses WHERE active = 1 ORDER BY display_order`);
  return res.json(courses);
}

export async function submitContact(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;
    await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [name?.trim(), email?.trim().toLowerCase(), phone?.trim(), subject?.trim(), message?.trim()]
    );
    return res.status(201).json({ message: 'Mensagem enviada com sucesso!' });
  } catch {
    return res.status(503).json({ error: 'Servico temporariamente indisponivel.' });
  }
}
