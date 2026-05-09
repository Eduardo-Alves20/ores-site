import { query, queryOne } from '../database/connection.js';
import pool from '../database/connection.js';
import { auditLog } from '../middleware/auth.js';
import { sanitizeText, sanitizeRichText } from '../middleware/validate.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { refreshWordOfDayCache } from '../services/wordOfDayService.js';
import { uploadsDir } from '../utils/uploads.js';

fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype)) {
      return cb(new Error('Formato de imagem inválido.'));
    }
    cb(null, true);
  },
}).single('file');

const uploadAudioVideo = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!/^(audio|video)\//.test(file.mimetype)) {
      return cb(new Error('Formato inválido. Envie um arquivo de áudio ou vídeo.'));
    }
    cb(null, true);
  },
}).single('file');

const SETTINGS_KEYS = [
  'site_name', 'site_tagline', 'site_logo_url', 'site_address', 'site_email', 'site_whatsapp',
  'site_phone', 'site_facebook', 'site_instagram', 'site_youtube', 'radio_stream_url',
  'daily_message', 'secretary_hours', 'maps_url',
  'hero_eyebrow', 'hero_title', 'hero_subtitle', 'hero_image_url', 'hero_primary_label',
  'hero_primary_url', 'hero_secondary_label', 'hero_secondary_url',
  'home_quick_title', 'home_mission_eyebrow', 'home_mission_title', 'home_mission_text',
  'home_mission_primary_label', 'home_mission_primary_url', 'home_mission_secondary_label',
  'home_mission_secondary_url',
  'home_stat_1_value', 'home_stat_1_suffix', 'home_stat_1_label', 'home_stat_1_no_count',
  'home_stat_2_value', 'home_stat_2_suffix', 'home_stat_2_label', 'home_stat_2_no_count',
  'home_stat_3_value', 'home_stat_3_suffix', 'home_stat_3_label', 'home_stat_3_no_count',
  'home_stat_4_value', 'home_stat_4_suffix', 'home_stat_4_label', 'home_stat_4_no_count',
  'donation_enabled', 'donation_eyebrow', 'donation_title', 'donation_text', 'donation_pix_key',
  'donation_background_url',
  'donation_qr_url', 'donation_button_label', 'donation_gallery_1_url', 'donation_gallery_1_caption',
  'donation_gallery_2_url', 'donation_gallery_2_caption', 'donation_gallery_3_url',
  'donation_gallery_3_caption',
  'conheca_eyebrow', 'conheca_title', 'conheca_subtitle', 'conheca_history_title',
  'conheca_history_text_1', 'conheca_history_text_2',
  'voluntario_eyebrow', 'voluntario_title', 'voluntario_subtitle', 'voluntario_cta_title',
  'voluntario_cta_text', 'voluntario_cta_label', 'voluntario_cta_url',
  'obra_social_eyebrow', 'obra_social_title', 'obra_social_subtitle', 'obra_social_mission_title',
  'obra_social_mission_text', 'obra_social_cta_label', 'obra_social_cta_url',
  'conheca_image_url', 'voluntario_image_url', 'obra_social_image_url',
  'news_eyebrow', 'news_title', 'news_subtitle', 'radio_eyebrow', 'radio_title', 'radio_subtitle',
  'homilies_eyebrow', 'homilies_title', 'homilies_subtitle', 'contact_eyebrow', 'contact_title',
  'contact_subtitle', 'priests_eyebrow', 'priests_title', 'priests_subtitle',
  'facilities_eyebrow', 'facilities_title', 'facilities_subtitle', 'calendar_eyebrow',
  'calendar_title', 'calendar_subtitle', 'rooms_eyebrow', 'rooms_title', 'rooms_subtitle',
  'groups_eyebrow', 'groups_title', 'groups_subtitle', 'pastorals_eyebrow',
  'pastorals_title', 'pastorals_subtitle', 'communities_eyebrow', 'communities_title',
  'communities_subtitle',
  'news_image_url', 'radio_image_url', 'homilies_image_url', 'contact_image_url',
  'priests_image_url', 'facilities_image_url', 'calendar_image_url', 'rooms_image_url',
  'groups_image_url', 'pastorals_image_url', 'communities_image_url',
  'menu_public_home', 'menu_public_parish', 'menu_public_about', 'menu_public_priests',
  'menu_public_facilities', 'menu_public_calendar', 'menu_public_rooms', 'menu_public_community',
  'menu_public_groups', 'menu_public_pastorals', 'menu_public_communities', 'menu_public_family',
  'menu_public_volunteer', 'menu_public_media', 'menu_public_news', 'menu_public_radio',
  'menu_public_homilies', 'menu_public_social', 'menu_public_social_about',
  'menu_public_social_services', 'menu_public_social_courses', 'menu_public_contact',
  'menu_public_home_enabled', 'menu_public_parish_enabled', 'menu_public_about_enabled', 'menu_public_priests_enabled',
  'menu_public_facilities_enabled', 'menu_public_calendar_enabled', 'menu_public_rooms_enabled', 'menu_public_community_enabled',
  'menu_public_groups_enabled', 'menu_public_pastorals_enabled', 'menu_public_communities_enabled', 'menu_public_family_enabled',
  'menu_public_volunteer_enabled', 'menu_public_media_enabled', 'menu_public_news_enabled', 'menu_public_radio_enabled',
  'menu_public_homilies_enabled', 'menu_public_social_enabled', 'menu_public_social_about_enabled',
  'menu_public_social_services_enabled', 'menu_public_social_courses_enabled', 'menu_public_contact_enabled',
  'menu_admin_dashboard', 'menu_admin_settings', 'menu_admin_hero_slides',
  'menu_admin_divider_content', 'menu_admin_news', 'menu_admin_events', 'menu_admin_homilies',
  'menu_admin_divider_parish', 'menu_admin_priests', 'menu_admin_mass', 'menu_admin_facilities',
  'menu_admin_bookings', 'menu_admin_divider_community', 'menu_admin_groups',
  'menu_admin_pastorals', 'menu_admin_communities', 'menu_admin_divider_social',
  'menu_admin_services', 'menu_admin_courses', 'menu_admin_divider_system',
  'menu_admin_messages', 'menu_admin_users', 'menu_admin_audit',
  'menu_admin_dashboard_enabled', 'menu_admin_settings_enabled', 'menu_admin_hero_slides_enabled',
  'menu_admin_divider_content_enabled', 'menu_admin_news_enabled', 'menu_admin_events_enabled', 'menu_admin_homilies_enabled',
  'menu_admin_divider_parish_enabled', 'menu_admin_priests_enabled', 'menu_admin_mass_enabled', 'menu_admin_facilities_enabled',
  'menu_admin_bookings_enabled', 'menu_admin_divider_community_enabled', 'menu_admin_groups_enabled',
  'menu_admin_pastorals_enabled', 'menu_admin_communities_enabled', 'menu_admin_divider_social_enabled',
  'menu_admin_services_enabled', 'menu_admin_courses_enabled', 'menu_admin_divider_system_enabled',
  'menu_admin_messages_enabled', 'menu_admin_users_enabled', 'menu_admin_audit_enabled',
  'word_day_mode', 'word_day_manual_title', 'word_day_manual_subtitle',
  'word_day_manual_content', 'word_day_manual_link',
];

// ── Generic CRUD helpers ─────────────────────────────────────────────────────
async function list(table, orderBy = 'id') {
  return query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
}

async function updateRecord(req, res, table, allowedFields, recordId, options = {}) {
  const richTextFields = new Set(options.richTextFields || []);
  const old = await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [recordId]);
  if (!old) return res.status(404).json({ error: 'Registro não encontrado.' });

  const updates = [];
  const values = [];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`\`${field}\` = ?`);
      if (typeof req.body[field] === 'string') {
        values.push(richTextFields.has(field) ? sanitizeRichText(req.body[field]) : sanitizeText(req.body[field]));
      } else {
        values.push(req.body[field]);
      }
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar.' });

  values.push(recordId);
  await query(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`, values);
  await auditLog(req.adminUser.id, `UPDATE_${table.toUpperCase()}`, table, recordId, old, req.body, req.ip);

  const updated = await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [recordId]);
  return res.json(updated);
}

async function deleteRecord(req, res, table, recordId) {
  const old = await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [recordId]);
  if (!old) return res.status(404).json({ error: 'Registro não encontrado.' });
  await query(`DELETE FROM ${table} WHERE id = ?`, [recordId]);
  await auditLog(req.adminUser.id, `DELETE_${table.toUpperCase()}`, table, recordId, old, null, req.ip);
  return res.json({ message: 'Excluído com sucesso.' });
}

// ── Dashboard stats ──────────────────────────────────────────────────────────
export async function getDashboardStats(req, res) {
  try {
    const [eventCount] = await query(`SELECT COUNT(*) as n FROM events WHERE active = 1`);
    const [newsCount] = await query(`SELECT COUNT(*) as n FROM news WHERE published = 1`);
    const [msgCount] = await query(`SELECT COUNT(*) as n FROM contact_messages WHERE read_at IS NULL`);
    const [bookingCount] = await query(`SELECT COUNT(*) as n FROM room_bookings WHERE status = 'pending'`);
    const recentLogs = await query(`SELECT al.*, au.name as admin_name FROM audit_log al LEFT JOIN admin_users au ON au.id = al.admin_id ORDER BY al.created_at DESC LIMIT 10`);
    const recentMessages = await query(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5`);

    return res.json({
      stats: {
        events: eventCount.n,
        news: newsCount.n,
        unreadMessages: msgCount.n,
        pendingBookings: bookingCount.n,
      },
      recentLogs,
      recentMessages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Site settings ────────────────────────────────────────────────────────────
export async function getSettings(req, res) {
  try {
    const rows = await query(`SELECT \`key\`, value FROM site_settings ORDER BY \`key\``);
    return res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateSettings(req, res) {
  try {
    for (const key of SETTINGS_KEYS) {
      if (req.body[key] !== undefined) {
        await query(
          `INSERT INTO site_settings (\`key\`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)`,
          [key, sanitizeText(String(req.body[key]))]
        );
      }
    }
    await auditLog(req.adminUser.id, 'UPDATE_SETTINGS', 'site_settings', null, null, req.body, req.ip);
    return res.json({ message: 'Configurações salvas.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function uploadMedia(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Erro no upload.' });
    if (!req.file) return res.status(400).json({ error: 'Arquivo obrigatório.' });
    const url = `/uploads/${req.file.filename}`;
    await auditLog(req.adminUser.id, 'UPLOAD_MEDIA', 'uploads', null, null, { url, name: req.file.originalname }, req.ip);
    return res.status(201).json({ url });
  });
}

export async function uploadHomilyMedia(req, res) {
  uploadAudioVideo(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Erro no upload.' });
    if (!req.file) return res.status(400).json({ error: 'Arquivo obrigatório.' });
    const url = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('audio/') ? 'audio' : 'video';
    await auditLog(req.adminUser.id, 'UPLOAD_HOMILY_MEDIA', 'uploads', null, null, { url, name: req.file.originalname, mediaType }, req.ip);
    return res.status(201).json({ url, mediaType });
  });
}

// ── Hero slides ──────────────────────────────────────────────────────────────
export async function listHeroSlides(req, res) {
  return res.json(await list('hero_slides', 'display_order, id'));
}

export async function createHeroSlide(req, res) {
  try {
    const {
      eyebrow, title, subtitle, image_url, primary_label, primary_url,
      secondary_label, secondary_url, duration_ms, display_order, active,
    } = req.body;
    const clean = (value) => sanitizeText(value || '');
    const [result] = await pool.execute(
      `INSERT INTO hero_slides (eyebrow, title, subtitle, image_url, primary_label, primary_url, secondary_label, secondary_url, duration_ms, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clean(eyebrow), clean(title), clean(subtitle), clean(image_url),
        clean(primary_label), clean(primary_url), clean(secondary_label),
        clean(secondary_url), Number(duration_ms) || 6000, Number(display_order) || 0,
        active === undefined ? 1 : Number(active) ? 1 : 0,
      ]
    );
    await auditLog(req.adminUser.id, 'CREATE_HERO_SLIDE', 'hero_slides', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateHeroSlide(req, res) {
  return updateRecord(req, res, 'hero_slides', [
    'eyebrow', 'title', 'subtitle', 'image_url', 'primary_label', 'primary_url',
    'secondary_label', 'secondary_url', 'duration_ms', 'display_order', 'active',
  ], parseInt(req.params.id));
}

export async function deleteHeroSlide(req, res) {
  return deleteRecord(req, res, 'hero_slides', parseInt(req.params.id));
}

export async function refreshWordOfDay(req, res) {
  try {
    const row = await refreshWordOfDayCache();
    await auditLog(req.adminUser.id, 'REFRESH_WORD_OF_DAY', 'word_of_day_cache', null, null, { date: row.date_key }, req.ip);
    return res.json({ message: 'Palavra do dia atualizada.', date: row.date_key, source_url: row.source_url });
  } catch {
    return res.status(500).json({ error: 'Falha ao atualizar a Palavra do dia.' });
  }
}

// ── Events ───────────────────────────────────────────────────────────────────
export async function listEvents(req, res) {
  return res.json(await list('events', 'event_date, start_time'));
}

export async function createEvent(req, res) {
  try {
    const { title, event_date, start_time, end_time, location, category, description } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO events (title, event_date, start_time, end_time, location, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sanitizeText(title), event_date, start_time || null, end_time || null, sanitizeText(location), sanitizeText(category), sanitizeText(description)]
    );
    await auditLog(req.adminUser.id, 'CREATE_EVENT', 'events', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateEvent(req, res) {
  return updateRecord(req, res, 'events', ['title', 'event_date', 'start_time', 'end_time', 'location', 'category', 'description', 'active'], parseInt(req.params.id));
}

export async function deleteEvent(req, res) {
  return deleteRecord(req, res, 'events', parseInt(req.params.id));
}

// ── News ─────────────────────────────────────────────────────────────────────
export async function listNews(req, res) {
  return res.json(await query(`SELECT * FROM news ORDER BY published_at DESC`));
}

export async function createNews(req, res) {
  try {
    const { title, slug, category, summary, content, image_url, external_url } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO news (title, slug, category, summary, content, image_url, external_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizeText(title),
        sanitizeText(slug),
        sanitizeText(category),
        sanitizeText(summary),
        sanitizeRichText(content),
        sanitizeText(image_url),
        sanitizeText(external_url),
      ]
    );
    await auditLog(req.adminUser.id, 'CREATE_NEWS', 'news', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Slug já existe.' });
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateNews(req, res) {
  return updateRecord(
    req,
    res,
    'news',
    ['title', 'slug', 'category', 'summary', 'content', 'image_url', 'external_url', 'published'],
    parseInt(req.params.id),
    { richTextFields: ['content'] }
  );
}

export async function deleteNews(req, res) {
  return deleteRecord(req, res, 'news', parseInt(req.params.id));
}

// ── Priests ──────────────────────────────────────────────────────────────────
export async function listPriests(req, res) {
  return res.json(await list('priests', 'display_order'));
}

export async function createPriest(req, res) {
  try {
    const { name, sigla, role, bio, photo_url, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO priests (name, sigla, role, bio, photo_url, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [sanitizeText(name), sanitizeText(sigla), sanitizeText(role), sanitizeText(bio), sanitizeText(photo_url), display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_PRIEST', 'priests', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updatePriest(req, res) {
  return updateRecord(req, res, 'priests', ['name', 'sigla', 'role', 'bio', 'photo_url', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deletePriest(req, res) {
  return deleteRecord(req, res, 'priests', parseInt(req.params.id));
}

// ── Mass schedule ────────────────────────────────────────────────────────────
export async function listMassSchedule(req, res) {
  const [scheduleRaw, times] = await Promise.all([
    query(`SELECT * FROM mass_schedule ORDER BY day_order`),
    query(`SELECT id, schedule_id, time_value AS time, priest_sigla AS sigla FROM mass_times`),
  ]);
  for (const s of scheduleRaw) {
    s.times = times.filter(t => t.schedule_id === s.id);
  }
  return res.json(scheduleRaw);
}

export async function updateMassDay(req, res) {
  try {
    const scheduleId = parseInt(req.params.id);
    const { times } = req.body; // [{ time: '07:00', sigla: 'MVS' }]
    await query(`DELETE FROM mass_times WHERE schedule_id = ?`, [scheduleId]);
    if (Array.isArray(times)) {
      for (const t of times) {
        await query(`INSERT INTO mass_times (schedule_id, time_value, priest_sigla) VALUES (?, ?, ?)`,
          [scheduleId, t.time, t.sigla || null]);
      }
    }
    await auditLog(req.adminUser.id, 'UPDATE_MASS_SCHEDULE', 'mass_times', scheduleId, null, req.body, req.ip);
    return res.json({ message: 'Horários atualizados.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

// ── Prayer groups ─────────────────────────────────────────────────────────────
export async function listGroups(req, res) {
  return res.json(await list('prayer_groups', 'display_order'));
}

export async function createGroup(req, res) {
  try {
    const { name, day_of_week, time_value, location, description, coordinator_phone, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO prayer_groups (name, day_of_week, time_value, location, description, coordinator_phone, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sanitizeText(name), sanitizeText(day_of_week), sanitizeText(time_value), sanitizeText(location), sanitizeText(description), sanitizeText(coordinator_phone), display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_GROUP', 'prayer_groups', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateGroup(req, res) {
  return updateRecord(req, res, 'prayer_groups', ['name', 'day_of_week', 'time_value', 'location', 'description', 'coordinator_phone', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deleteGroup(req, res) {
  return deleteRecord(req, res, 'prayer_groups', parseInt(req.params.id));
}

// ── Pastorals ────────────────────────────────────────────────────────────────
export async function listPastorals(req, res) {
  return res.json(await list('pastorals', 'category, display_order'));
}

export async function createPastoral(req, res) {
  try {
    const { name, category, description, coordinator, phone, meeting_day, meeting_time, location, address, map_url, image_url, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO pastorals (name, category, description, coordinator, phone, meeting_day, meeting_time, location, address, map_url, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sanitizeText(name), sanitizeText(category), sanitizeRichText(description), sanitizeText(coordinator), sanitizeText(phone), sanitizeText(meeting_day), sanitizeText(meeting_time), sanitizeText(location), sanitizeText(address), sanitizeText(map_url), sanitizeText(image_url), display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_PASTORAL', 'pastorals', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updatePastoral(req, res) {
  return updateRecord(
    req,
    res,
    'pastorals',
    ['name', 'category', 'description', 'coordinator', 'phone', 'meeting_day', 'meeting_time', 'location', 'address', 'map_url', 'image_url', 'display_order', 'active'],
    parseInt(req.params.id),
    { richTextFields: ['description'] }
  );
}

export async function deletePastoral(req, res) {
  return deleteRecord(req, res, 'pastorals', parseInt(req.params.id));
}

export async function listPastoralSlides(req, res) {
  return res.json(await list('pastoral_slides', 'display_order, id'));
}

export async function createPastoralSlide(req, res) {
  try {
    const { title, subtitle, image_url, display_order, active } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO pastoral_slides (title, subtitle, image_url, display_order, active) VALUES (?, ?, ?, ?, ?)`,
      [
        sanitizeText(title),
        sanitizeText(subtitle),
        sanitizeText(image_url),
        display_order || 0,
        active === undefined ? 1 : Number(active) ? 1 : 0,
      ]
    );
    await auditLog(req.adminUser.id, 'CREATE_PASTORAL_SLIDE', 'pastoral_slides', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updatePastoralSlide(req, res) {
  return updateRecord(req, res, 'pastoral_slides', ['title', 'subtitle', 'image_url', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deletePastoralSlide(req, res) {
  return deleteRecord(req, res, 'pastoral_slides', parseInt(req.params.id));
}

// ── Communities ──────────────────────────────────────────────────────────────
export async function listCommunities(req, res) {
  return res.json(await list('communities', 'display_order'));
}

export async function createCommunity(req, res) {
  try {
    const { name, neighborhood, coordinator_name, coordinator_phone, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO communities (name, neighborhood, coordinator_name, coordinator_phone, display_order) VALUES (?, ?, ?, ?, ?)`,
      [sanitizeText(name), sanitizeText(neighborhood), sanitizeText(coordinator_name), sanitizeText(coordinator_phone), display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_COMMUNITY', 'communities', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateCommunity(req, res) {
  return updateRecord(req, res, 'communities', ['name', 'neighborhood', 'coordinator_name', 'coordinator_phone', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deleteCommunity(req, res) {
  return deleteRecord(req, res, 'communities', parseInt(req.params.id));
}

// ── Facilities ───────────────────────────────────────────────────────────────
export async function listFacilities(req, res) {
  return res.json(await list('facilities', 'display_order'));
}

export async function updateFacility(req, res) {
  return updateRecord(req, res, 'facilities', ['name', 'description', 'icon', 'capacity', 'display_order', 'active'], parseInt(req.params.id));
}

// ── Room bookings ─────────────────────────────────────────────────────────────
export async function listBookings(req, res) {
  try {
    const bookings = await query(
      `SELECT rb.*, f.name AS facility_name FROM room_bookings rb
       JOIN facilities f ON f.id = rb.facility_id ORDER BY rb.booking_date DESC`
    );
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateBookingStatus(req, res) {
  return updateRecord(req, res, 'room_bookings', ['status'], parseInt(req.params.id));
}

// ── Homilies ─────────────────────────────────────────────────────────────────
export async function listHomilies(req, res) {
  return res.json(await list('homilies', 'published_at DESC'));
}

export async function createHomily(req, res) {
  try {
    const { title, priest_name, type, duration, audio_url, video_url, published_at } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO homilies (title, priest_name, type, duration, audio_url, video_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sanitizeText(title), sanitizeText(priest_name), type, sanitizeText(duration), sanitizeText(audio_url), sanitizeText(video_url), published_at || null]
    );
    await auditLog(req.adminUser.id, 'CREATE_HOMILY', 'homilies', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateHomily(req, res) {
  return updateRecord(req, res, 'homilies', ['title', 'priest_name', 'type', 'duration', 'audio_url', 'video_url', 'published_at', 'active'], parseInt(req.params.id));
}

export async function deleteHomily(req, res) {
  return deleteRecord(req, res, 'homilies', parseInt(req.params.id));
}

// ── Courses ──────────────────────────────────────────────────────────────────
export async function listCourses(req, res) {
  return res.json(await list('courses', 'display_order'));
}

export async function createCourse(req, res) {
  try {
    const { name, duration, schedule, vacancies, description, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO courses (name, duration, schedule, vacancies, description, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [sanitizeText(name), sanitizeText(duration), sanitizeText(schedule), vacancies || null, sanitizeText(description), display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_COURSE', 'courses', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateCourse(req, res) {
  return updateRecord(req, res, 'courses', ['name', 'duration', 'schedule', 'vacancies', 'description', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deleteCourse(req, res) {
  return deleteRecord(req, res, 'courses', parseInt(req.params.id));
}

// ── Social services ───────────────────────────────────────────────────────────
export async function listServices(req, res) {
  return res.json(await list('social_services', 'display_order'));
}

export async function updateService(req, res) {
  return updateRecord(req, res, 'social_services', ['title', 'description', 'icon', 'display_order', 'active'], parseInt(req.params.id));
}

// ── Contact messages ──────────────────────────────────────────────────────────
export async function listMessages(req, res) {
  try {
    const messages = await query(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100`);
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function markMessageRead(req, res) {
  try {
    await query(`UPDATE contact_messages SET read_at = NOW() WHERE id = ?`, [parseInt(req.params.id)]);
    return res.json({ message: 'Mensagem marcada como lida.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function deleteMessage(req, res) {
  return deleteRecord(req, res, 'contact_messages', parseInt(req.params.id));
}

// ── Admin users (super_admin only) ────────────────────────────────────────────
export async function listAdminUsers(req, res) {
  try {
    const users = await query(`SELECT id, name, email, role, last_login, created_at FROM admin_users ORDER BY id`);
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function createAdminUser(req, res) {
  try {
    const bcrypt = await import('bcryptjs');
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    if (password.length < 8) return res.status(422).json({ error: 'Senha deve ter pelo menos 8 caracteres.' });
    const hash = await bcrypt.default.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [sanitizeText(name), email.toLowerCase().trim(), hash, role === 'super_admin' ? 'super_admin' : 'editor']
    );
    await auditLog(req.adminUser.id, 'CREATE_ADMIN_USER', 'admin_users', result.insertId, null, { name, email, role }, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'E-mail já cadastrado.' });
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function deleteAdminUser(req, res) {
  const userId = parseInt(req.params.id);
  if (userId === req.adminUser.id) return res.status(400).json({ error: 'Não é possível excluir a própria conta.' });
  return deleteRecord(req, res, 'admin_users', userId);
}

// ── Audit log ────────────────────────────────────────────────────────────────
export async function getAuditLog(req, res) {
  try {
    const logs = await query(
      `SELECT al.*, au.name as admin_name FROM audit_log al
       LEFT JOIN admin_users au ON au.id = al.admin_id
       ORDER BY al.created_at DESC LIMIT 200`
    );
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
