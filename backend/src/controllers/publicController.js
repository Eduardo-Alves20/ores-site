import { query, queryOne } from '../database/connection.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getSetting(key) {
  const row = await queryOne(`SELECT value FROM site_settings WHERE \`key\` = ?`, [key]);
  return row?.value ?? null;
}

async function getSettings(keys) {
  const placeholders = keys.map(() => '?').join(',');
  const rows = await query(`SELECT \`key\`, value FROM site_settings WHERE \`key\` IN (${placeholders})`, keys);
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

// Groups an array of detail rows onto parent rows by a foreign-key field.
// Avoids JSON_ARRAYAGG which is unavailable in MariaDB < 10.5.
function groupBy(parents, details, fk, field) {
  const map = {};
  for (const p of parents) map[p.id] = p;
  for (const d of details) {
    if (!map[d[fk]]) continue;
    if (!map[d[fk]][field]) map[d[fk]][field] = [];
    map[d[fk]][field].push(d);
  }
  for (const p of parents) if (!p[field]) p[field] = [];
  return parents;
}

// ── Home data ────────────────────────────────────────────────────────────────
export async function getHomeData(req, res) {
  try {
    const settings = await getSettings([
      'daily_message', 'hero_title', 'hero_subtitle',
    ]);

    const events = await query(
      `SELECT id, title, event_date, start_time, end_time, location, category
       FROM events WHERE active = 1 AND event_date >= CURDATE()
       ORDER BY event_date, start_time LIMIT 6`
    );

    const [massScheduleRaw, massTimes, confessions] = await Promise.all([
      query(`SELECT id, day_name, day_short, day_order FROM mass_schedule ORDER BY day_order`),
      query(`SELECT schedule_id, time_value AS time, priest_sigla AS sigla FROM mass_times`),
      query(`SELECT day_name, times FROM confession_schedule ORDER BY display_order`),
    ]);
    const massSchedule = groupBy(massScheduleRaw, massTimes, 'schedule_id', 'times');

    const news = await query(
      `SELECT id, title, slug, category, summary, image_url, published_at
       FROM news WHERE published = 1 ORDER BY published_at DESC LIMIT 3`
    );

    return res.json({ settings, events, massSchedule, confessions, news });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Site settings (public) ───────────────────────────────────────────────────
export async function getSiteInfo(req, res) {
  try {
    const settings = await getSettings([
      'site_name', 'site_address', 'site_email', 'site_whatsapp',
      'site_phone', 'site_facebook', 'site_instagram', 'site_youtube',
      'radio_stream_url', 'secretary_hours', 'maps_url',
    ]);
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Mass schedule ────────────────────────────────────────────────────────────
export async function getMassSchedule(req, res) {
  try {
    const [scheduleRaw, times, confessions] = await Promise.all([
      query(`SELECT id, day_name, day_short, day_order FROM mass_schedule ORDER BY day_order`),
      query(`SELECT schedule_id, time_value AS time, priest_sigla AS sigla FROM mass_times`),
      query(`SELECT * FROM confession_schedule ORDER BY display_order`),
    ]);
    const schedule = groupBy(scheduleRaw, times, 'schedule_id', 'times');
    return res.json({ schedule, confessions });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Events ───────────────────────────────────────────────────────────────────
export async function getEvents(req, res) {
  try {
    const events = await query(
      `SELECT id, title, event_date, start_time, end_time, location, category, description
       FROM events WHERE active = 1 ORDER BY event_date, start_time`
    );
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Priests ──────────────────────────────────────────────────────────────────
export async function getPriests(req, res) {
  try {
    const [priests, masses] = await Promise.all([
      query(`SELECT id, name, sigla, role, bio, photo_url FROM priests WHERE active = 1 ORDER BY display_order`),
      query(`SELECT priest_id, mass_label FROM priest_masses`),
    ]);
    for (const p of priests) {
      p.masses = masses.filter(m => m.priest_id === p.id).map(m => m.mass_label);
    }
    return res.json(priests);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── News ─────────────────────────────────────────────────────────────────────
export async function getNews(req, res) {
  try {
    const news = await query(
      `SELECT id, title, slug, category, summary, image_url, published_at
       FROM news WHERE published = 1 ORDER BY published_at DESC LIMIT 20`
    );
    return res.json(news);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function getNewsItem(req, res) {
  try {
    const item = await queryOne(
      `SELECT * FROM news WHERE slug = ? AND published = 1`,
      [req.params.slug]
    );
    if (!item) return res.status(404).json({ error: 'Notícia não encontrada.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Prayer groups ─────────────────────────────────────────────────────────────
export async function getPrayerGroups(req, res) {
  try {
    const groups = await query(
      `SELECT * FROM prayer_groups WHERE active = 1 ORDER BY display_order`
    );
    return res.json(groups);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Pastorals ────────────────────────────────────────────────────────────────
export async function getPastorals(req, res) {
  try {
    const pastorals = await query(
      `SELECT * FROM pastorals WHERE active = 1 ORDER BY category, display_order`
    );
    return res.json(pastorals);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Communities ──────────────────────────────────────────────────────────────
export async function getCommunities(req, res) {
  try {
    const communities = await query(
      `SELECT * FROM communities WHERE active = 1 ORDER BY display_order`
    );
    return res.json(communities);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Facilities ───────────────────────────────────────────────────────────────
export async function getFacilities(req, res) {
  try {
    const facilities = await query(
      `SELECT * FROM facilities WHERE active = 1 ORDER BY display_order`
    );
    return res.json(facilities);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Room bookings (calendar) ─────────────────────────────────────────────────
export async function getRoomBookings(req, res) {
  try {
    const { month, year } = req.query;
    let sql = `SELECT rb.*, f.name AS facility_name, f.icon AS facility_icon
               FROM room_bookings rb
               JOIN facilities f ON f.id = rb.facility_id
               WHERE rb.status != 'cancelled'`;
    const params = [];
    if (month && year) {
      sql += ` AND MONTH(rb.booking_date) = ? AND YEAR(rb.booking_date) = ?`;
      params.push(parseInt(month), parseInt(year));
    }
    sql += ' ORDER BY rb.booking_date, rb.start_time';
    const bookings = await query(sql, params);
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function createRoomBooking(req, res) {
  try {
    const { facility_id, title, description, booking_date, start_time, end_time, requester_name, requester_phone } = req.body;

    // Check for conflicts
    const conflict = await queryOne(
      `SELECT id FROM room_bookings
       WHERE facility_id = ? AND booking_date = ? AND status != 'cancelled'
         AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))`,
      [facility_id, booking_date, end_time, start_time, start_time, end_time]
    );
    if (conflict) {
      return res.status(409).json({ error: 'Horário já reservado para esta sala.' });
    }

    await query(
      `INSERT INTO room_bookings (facility_id, title, description, booking_date, start_time, end_time, requester_name, requester_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [facility_id, title, description, booking_date, start_time, end_time, requester_name, requester_phone]
    );
    return res.status(201).json({ message: 'Agendamento solicitado. Aguarde confirmação.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Social services & courses ────────────────────────────────────────────────
export async function getSocialServices(req, res) {
  try {
    const services = await query(`SELECT * FROM social_services WHERE active = 1 ORDER BY display_order`);
    const courses = await query(`SELECT * FROM courses WHERE active = 1 ORDER BY display_order`);
    return res.json({ services, courses });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Homilies ─────────────────────────────────────────────────────────────────
export async function getHomilies(req, res) {
  try {
    const homilies = await query(
      `SELECT * FROM homilies WHERE active = 1 ORDER BY published_at DESC LIMIT 20`
    );
    return res.json(homilies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Contact form ─────────────────────────────────────────────────────────────
export async function submitContact(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;
    await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [name?.trim(), email?.trim().toLowerCase(), phone?.trim(), subject?.trim(), message?.trim()]
    );
    return res.status(201).json({ message: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
}
