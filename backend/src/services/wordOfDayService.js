import sanitizeHtml from 'sanitize-html';
import { query, queryOne } from '../database/connection.js';

const VATICAN_BASE = 'https://www.vaticannews.va';
const DEFAULT_PATH = '/pt/palavra-do-dia.html';
const TZ = 'America/Sao_Paulo';

let inflight = null;

function dateKeySaoPaulo(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function datePath(dateKey) {
  const [y, m, d] = dateKey.split('-');
  return `/pt/palavra-do-dia/${y}/${m}/${d}.html`;
}

function extractMeta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i');
  return html.match(re)?.[1]?.trim() || '';
}

function extractSectionContent(html, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<section[^>]*>[\\s\\S]*?<h2>\\s*${escaped}\\s*<\\/h2>[\\s\\S]*?<div class="section__content">([\\s\\S]*?)<\\/div>[\\s\\S]*?<\\/section>`, 'i');
  return html.match(re)?.[1] || '';
}

function cleanHtml(content) {
  return sanitizeHtml(content || '', {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  }).trim();
}

async function fetchVaticanWordOfDay(dateKey) {
  const path = datePath(dateKey);
  const sourceUrl = `${VATICAN_BASE}${path}`;
  const response = await fetch(sourceUrl, {
    headers: { 'User-Agent': 'PES-WordOfDay/1.0 (+https://igreja-oris)' },
  });
  if (!response.ok) throw new Error(`Falha ao buscar Vatican News (${response.status})`);

  const html = await response.text();
  const sourceTitle = extractMeta(html, 'og:title') || `Palavra do dia ${dateKey}`;
  const sourceDescription = extractMeta(html, 'description') || extractMeta(html, 'og:description') || '';
  const readingHtml = cleanHtml(extractSectionContent(html, 'Leitura do Dia'));
  const gospelHtml = cleanHtml(extractSectionContent(html, 'Evangelho do Dia'));
  const popeWordsHtml = cleanHtml(extractSectionContent(html, 'As palavras dos Papas'));

  return {
    date_key: dateKey,
    source_url: sourceUrl,
    source_title: sourceTitle,
    source_description: sourceDescription,
    reading_html: readingHtml,
    gospel_html: gospelHtml,
    pope_words_html: popeWordsHtml,
    fetched_at: new Date(),
  };
}

async function upsertCache(row) {
  await query(
    `INSERT INTO word_of_day_cache (date_key, source_url, source_title, source_description, reading_html, gospel_html, pope_words_html, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       source_url = VALUES(source_url),
       source_title = VALUES(source_title),
       source_description = VALUES(source_description),
       reading_html = VALUES(reading_html),
       gospel_html = VALUES(gospel_html),
       pope_words_html = VALUES(pope_words_html),
       fetched_at = VALUES(fetched_at)`,
    [
      row.date_key,
      row.source_url,
      row.source_title,
      row.source_description,
      row.reading_html,
      row.gospel_html,
      row.pope_words_html,
      row.fetched_at,
    ]
  );
}

async function getCached(dateKey) {
  return queryOne(`SELECT * FROM word_of_day_cache WHERE date_key = ?`, [dateKey]);
}

async function getLatestCached() {
  return queryOne(`SELECT * FROM word_of_day_cache ORDER BY date_key DESC LIMIT 1`);
}

async function getWordModeSettings() {
  const rows = await query(
    `SELECT \`key\`, value FROM site_settings
     WHERE \`key\` IN ('word_day_mode', 'word_day_manual_title', 'word_day_manual_subtitle', 'word_day_manual_content', 'word_day_manual_link')`
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function manualPayload(settings) {
  return {
    mode: 'manual',
    source: 'manual',
    title: settings.word_day_manual_title || 'Palavra do Dia',
    subtitle: settings.word_day_manual_subtitle || '',
    content_html: cleanHtml(`<p>${(settings.word_day_manual_content || '').replace(/\n/g, '<br/>')}</p>`),
    link_url: settings.word_day_manual_link || '',
    source_url: settings.word_day_manual_link || '',
    date_key: dateKeySaoPaulo(),
  };
}

function cachePayload(row) {
  if (!row) return null;
  const sections = [
    row.source_description ? `<p>${row.source_description}</p>` : '',
    row.reading_html ? `<h3>Leitura do Dia</h3>${row.reading_html}` : '',
    row.gospel_html ? `<h3>Evangelho do Dia</h3>${row.gospel_html}` : '',
    row.pope_words_html ? `<h3>As palavras dos Papas</h3>${row.pope_words_html}` : '',
  ].filter(Boolean).join('');
  return {
    mode: 'auto',
    source: 'vatican',
    title: row.source_title || 'Palavra do Dia',
    subtitle: row.source_description || '',
    content_html: cleanHtml(sections),
    link_url: row.source_url,
    source_url: row.source_url,
    date_key: row.date_key,
    fetched_at: row.fetched_at,
  };
}

export async function refreshWordOfDayCache() {
  if (inflight) return inflight;
  inflight = (async () => {
    const dateKey = dateKeySaoPaulo();
    const fresh = await fetchVaticanWordOfDay(dateKey);
    await upsertCache(fresh);
    return fresh;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export async function getWordOfDayPayload() {
  const settings = await getWordModeSettings();
  const mode = (settings.word_day_mode || 'auto').toLowerCase();
  if (mode === 'manual' && settings.word_day_manual_content) {
    return manualPayload(settings);
  }

  const dateKey = dateKeySaoPaulo();
  let row = await getCached(dateKey);
  if (!row) {
    try {
      await refreshWordOfDayCache();
      row = await getCached(dateKey);
    } catch {
      row = await getLatestCached();
    }
  }
  return cachePayload(row) || {
    mode: 'auto',
    source: 'vatican',
    title: 'Palavra do Dia',
    subtitle: 'Conteúdo indisponível no momento.',
    content_html: '',
    link_url: `${VATICAN_BASE}${DEFAULT_PATH}`,
    source_url: `${VATICAN_BASE}${DEFAULT_PATH}`,
    date_key: dateKey,
  };
}
