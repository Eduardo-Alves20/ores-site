import { query, queryOne } from '../database/connection.js';
import pool from '../database/connection.js';
import { auditLog } from '../middleware/auth.js';
import { sanitizeText, sanitizeRichText, validatePasswordStrength } from '../middleware/validate.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
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
    // SVG excluded — can contain embedded JavaScript (XSS vector)
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
      return cb(new Error('Formato de imagem inválido. Use PNG, JPG, WEBP ou GIF.'));
    }
    cb(null, true);
  },
}).single('file');

const SETTINGS_KEYS = [
  'site_name', 'site_tagline', 'site_logo_url', 'site_address', 'site_email', 'site_whatsapp',
  'site_phone', 'site_facebook', 'site_instagram', 'site_youtube',
  'secretary_hours', 'maps_url',
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
  'donation_background_url', 'donation_qr_url', 'donation_button_label',
  'donation_gallery_1_url', 'donation_gallery_1_caption',
  'donation_gallery_2_url', 'donation_gallery_2_caption',
  'donation_gallery_3_url', 'donation_gallery_3_caption',
  'quem_somos_eyebrow', 'quem_somos_title', 'quem_somos_subtitle', 'quem_somos_image_url',
  'quem_somos_history_title', 'quem_somos_history_text_1', 'quem_somos_history_text_2',
  'voluntario_eyebrow', 'voluntario_title', 'voluntario_subtitle', 'voluntario_image_url',
  'voluntario_cta_title', 'voluntario_cta_text', 'voluntario_cta_label', 'voluntario_cta_url',
  'voluntario_area_1_icon', 'voluntario_area_1_title', 'voluntario_area_1_desc',
  'voluntario_area_2_icon', 'voluntario_area_2_title', 'voluntario_area_2_desc',
  'voluntario_area_3_icon', 'voluntario_area_3_title', 'voluntario_area_3_desc',
  'voluntario_area_4_icon', 'voluntario_area_4_title', 'voluntario_area_4_desc',
  'obra_social_eyebrow', 'obra_social_title', 'obra_social_subtitle', 'obra_social_image_url',
  'obra_social_mission_title', 'obra_social_mission_text', 'obra_social_cta_label', 'obra_social_cta_url',
  'regionais_eyebrow', 'regionais_title', 'regionais_subtitle', 'regionais_image_url',
  'projetos_eyebrow', 'projetos_title', 'projetos_subtitle', 'projetos_image_url',
  'espaco_ores_eyebrow', 'espaco_ores_title', 'espaco_ores_subtitle', 'espaco_ores_image_url',
  'news_eyebrow', 'news_title', 'news_subtitle', 'news_image_url',
  'contact_eyebrow', 'contact_title', 'contact_subtitle', 'contact_image_url',
  'calendar_eyebrow', 'calendar_title', 'calendar_subtitle', 'calendar_image_url',
  'programs_image_url', 'courses_image_url', 'projects_image_url', 'regionais_page_image_url',
  'menu_public_home', 'menu_public_sobre', 'menu_public_quem_somos', 'menu_public_regionais',
  'menu_public_projetos', 'menu_public_espaco', 'menu_public_programas', 'menu_public_programas_sobre',
  'menu_public_programas_cursos', 'menu_public_galeria', 'menu_public_noticias', 'menu_public_eventos',
  'menu_public_voluntario', 'menu_public_contato',
  'menu_public_home_enabled', 'menu_public_sobre_enabled', 'menu_public_quem_somos_enabled',
  'menu_public_regionais_enabled', 'menu_public_projetos_enabled', 'menu_public_espaco_enabled',
  'menu_public_programas_enabled', 'menu_public_programas_sobre_enabled',
  'menu_public_programas_cursos_enabled', 'menu_public_galeria_enabled',
  'menu_public_noticias_enabled', 'menu_public_eventos_enabled',
  'menu_public_voluntario_enabled', 'menu_public_contato_enabled',
  'menu_admin_dashboard', 'menu_admin_settings', 'menu_admin_hero_slides',
  'menu_admin_divider_conteudo', 'menu_admin_news', 'menu_admin_events',
  'menu_admin_divider_ong', 'menu_admin_regionais', 'menu_admin_projetos', 'menu_admin_espaco',
  'menu_admin_divider_programas', 'menu_admin_services', 'menu_admin_courses',
  'menu_admin_divider_system', 'menu_admin_messages', 'menu_admin_users', 'menu_admin_audit',
  'menu_admin_dashboard_enabled', 'menu_admin_settings_enabled', 'menu_admin_hero_slides_enabled',
  'menu_admin_divider_conteudo_enabled', 'menu_admin_news_enabled', 'menu_admin_events_enabled',
  'menu_admin_divider_ong_enabled', 'menu_admin_regionais_enabled', 'menu_admin_projetos_enabled',
  'menu_admin_espaco_enabled', 'menu_admin_divider_programas_enabled',
  'menu_admin_services_enabled', 'menu_admin_courses_enabled',
  'menu_admin_divider_system_enabled', 'menu_admin_messages_enabled',
  'menu_admin_users_enabled', 'menu_admin_audit_enabled',
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

function slugify(value) {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 280);
  return slug || 'noticia';
}

async function uniqueNewsSlug(baseSlug, ignoreId = null) {
  let suffix = 2;
  const cleanBase = slugify(baseSlug);
  let candidate = cleanBase;
  while (true) {
    const params = ignoreId ? [candidate, ignoreId] : [candidate];
    const where = ignoreId ? 'slug = ? AND id <> ?' : 'slug = ?';
    const existing = await queryOne(`SELECT id FROM news WHERE ${where}`, params);
    if (!existing) return candidate;
    const suffixText = `-${suffix++}`;
    candidate = `${cleanBase.slice(0, 300 - suffixText.length)}${suffixText}`;
  }
}

// ── Dashboard stats ──────────────────────────────────────────────────────────
export async function getDashboardStats(req, res) {
  try {
    const [eventCount] = await query(`SELECT COUNT(*) as n FROM events WHERE active = 1`);
    const [newsCount] = await query(`SELECT COUNT(*) as n FROM news WHERE published = 1`);
    const [msgCount] = await query(`SELECT COUNT(*) as n FROM contact_messages WHERE read_at IS NULL`);
    const [regionalCount] = await query(`SELECT COUNT(*) as n FROM regional_units WHERE active = 1`);
    const recentLogs = await query(`SELECT al.*, au.name as admin_name FROM audit_log al LEFT JOIN admin_users au ON au.id = al.admin_id ORDER BY al.created_at DESC LIMIT 10`);
    const recentMessages = await query(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5`);

    return res.json({
      stats: {
        events: eventCount.n,
        news: newsCount.n,
        unreadMessages: msgCount.n,
        regionais: regionalCount.n,
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
    const richTextKeys = new Set([
      'site_address', 'hero_subtitle', 'home_mission_text', 'donation_text',
      'quem_somos_subtitle', 'quem_somos_history_text_1', 'quem_somos_history_text_2',
      'voluntario_subtitle', 'voluntario_cta_text',
      'voluntario_area_1_desc', 'voluntario_area_2_desc', 'voluntario_area_3_desc', 'voluntario_area_4_desc',
      'obra_social_subtitle', 'obra_social_mission_text',
      'regionais_subtitle', 'projetos_subtitle', 'espaco_ores_subtitle',
      'news_subtitle', 'contact_subtitle', 'calendar_subtitle',
    ]);

    for (const key of SETTINGS_KEYS) {
      if (req.body[key] !== undefined) {
        const cleanValue = richTextKeys.has(key)
          ? sanitizeRichText(String(req.body[key]))
          : sanitizeText(String(req.body[key]));
        await query(
          `INSERT INTO site_settings (\`key\`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)`,
          [key, cleanValue]
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
    const newsSlug = await uniqueNewsSlug(slug || title);
    const [result] = await pool.execute(
      `INSERT INTO news (title, slug, category, summary, content, image_url, external_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizeText(title), newsSlug, sanitizeText(category), sanitizeText(summary),
        sanitizeRichText(content), sanitizeText(image_url), sanitizeText(external_url),
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
  const recordId = parseInt(req.params.id);
  if (req.body.slug !== undefined) {
    const old = await queryOne(`SELECT title FROM news WHERE id = ?`, [recordId]);
    req.body.slug = await uniqueNewsSlug(req.body.slug || req.body.title || old?.title, recordId);
  }
  return updateRecord(req, res, 'news',
    ['title', 'slug', 'category', 'summary', 'content', 'image_url', 'external_url', 'published'],
    recordId, { richTextFields: ['content'] }
  );
}

export async function deleteNews(req, res) {
  return deleteRecord(req, res, 'news', parseInt(req.params.id));
}

// ── Regional Units ────────────────────────────────────────────────────────────
export async function listRegionais(req, res) {
  return res.json(await list('regional_units', 'display_order, id'));
}

export async function createRegional(req, res) {
  try {
    const { name, city, state, address, phone, email, coordinator, description, image_url, maps_url, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO regional_units (name, city, state, address, phone, email, coordinator, description, image_url, maps_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizeText(name), sanitizeText(city), sanitizeText(state || 'RJ'),
        sanitizeText(address), sanitizeText(phone), sanitizeText(email),
        sanitizeText(coordinator), sanitizeRichText(description),
        sanitizeText(image_url), sanitizeText(maps_url), display_order || 0,
      ]
    );
    await auditLog(req.adminUser.id, 'CREATE_REGIONAL', 'regional_units', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateRegional(req, res) {
  return updateRecord(req, res, 'regional_units',
    ['name', 'city', 'state', 'address', 'phone', 'email', 'coordinator', 'description', 'image_url', 'maps_url', 'display_order', 'active'],
    parseInt(req.params.id),
    { richTextFields: ['description'] }
  );
}

export async function deleteRegional(req, res) {
  return deleteRecord(req, res, 'regional_units', parseInt(req.params.id));
}

// ── Projects (pastorals table) ────────────────────────────────────────────────
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
    await auditLog(req.adminUser.id, 'CREATE_PROJETO', 'pastorals', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updatePastoral(req, res) {
  return updateRecord(req, res, 'pastorals',
    ['name', 'category', 'description', 'coordinator', 'phone', 'meeting_day', 'meeting_time', 'location', 'address', 'map_url', 'image_url', 'display_order', 'active'],
    parseInt(req.params.id), { richTextFields: ['description'] }
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
      [sanitizeText(title), sanitizeText(subtitle), sanitizeText(image_url), display_order || 0, active === undefined ? 1 : Number(active) ? 1 : 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_PROJETO_SLIDE', 'pastoral_slides', result.insertId, null, req.body, req.ip);
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

// ── Facilities (Espaço ORES) ──────────────────────────────────────────────────
export async function listFacilities(req, res) {
  return res.json(await list('facilities', 'display_order'));
}

export async function createFacility(req, res) {
  try {
    const { name, description, icon, capacity, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO facilities (name, description, icon, capacity, display_order) VALUES (?, ?, ?, ?, ?)`,
      [sanitizeText(name), sanitizeRichText(description), sanitizeText(icon), capacity || null, display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_FACILITY', 'facilities', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateFacility(req, res) {
  return updateRecord(req, res, 'facilities', ['name', 'description', 'icon', 'capacity', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deleteFacility(req, res) {
  return deleteRecord(req, res, 'facilities', parseInt(req.params.id));
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

// ── Social programs ───────────────────────────────────────────────────────────
export async function listServices(req, res) {
  return res.json(await list('social_services', 'display_order'));
}

export async function createService(req, res) {
  try {
    const { title, description, icon, display_order } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO social_services (title, description, icon, display_order) VALUES (?, ?, ?, ?)`,
      [sanitizeText(title), sanitizeRichText(description), sanitizeText(icon), display_order || 0]
    );
    await auditLog(req.adminUser.id, 'CREATE_SERVICE', 'social_services', result.insertId, null, req.body, req.ip);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function updateService(req, res) {
  return updateRecord(req, res, 'social_services', ['title', 'description', 'icon', 'display_order', 'active'], parseInt(req.params.id));
}

export async function deleteService(req, res) {
  return deleteRecord(req, res, 'social_services', parseInt(req.params.id));
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
    const pwdError = validatePasswordStrength(password, { email });
    if (pwdError) return res.status(422).json({ error: pwdError });
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

// ── Donations ────────────────────────────────────────────────────────────────
export async function getDonationStats(req, res) {
  try {
    const rows = await query(`
      SELECT
        COUNT(*) AS total_count,
        COALESCE(SUM(CASE WHEN status='completed' THEN amount ELSE 0 END), 0) AS total_amount,
        COALESCE(AVG(CASE WHEN status='completed' THEN amount END), 0) AS avg_amount,
        COALESCE(SUM(CASE WHEN status='completed'
          AND MONTH(payment_date)=MONTH(NOW())
          AND YEAR(payment_date)=YEAR(NOW())
          THEN amount ELSE 0 END), 0) AS this_month,
        COALESCE(SUM(CASE WHEN status='completed'
          AND MONTH(payment_date)=MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
          AND YEAR(payment_date)=YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
          THEN amount ELSE 0 END), 0) AS last_month,
        COALESCE(SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END), 0) AS completed_count,
        COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END), 0) AS pending_count
      FROM donations
    `);
    return res.json(rows[0] || {});
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

export async function listDonations(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status || '';

    const where  = status ? 'WHERE status = ?' : '';
    const params = status ? [status] : [];

    const countRows = await query(`SELECT COUNT(*) AS n FROM donations ${where}`, params);
    const total     = Number(countRows[0]?.n || 0);

    // LIMIT/OFFSET injected directly as validated integers (mysql2 execute()
    // has issues with these as bound parameters in prepared statements)
    const rows = await query(
      `SELECT id, txn_id, payer_email, payer_name, amount, currency, status, payment_date, item_name, created_at
       FROM donations ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    return res.json({ data: rows, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

