import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pool from './connection.js';

dotenv.config();

function decodeHtmlEntities(value) {
  if (!value) return '';

  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isNaN(code) ? _m : String.fromCodePoint(code);
    })
    .replace(/&#([0-9]+);/g, (_m, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isNaN(code) ? _m : String.fromCodePoint(code);
    })
    .replace(/&([a-z]+);/gi, (_m, name) => named[name.toLowerCase()] ?? _m);
}

function stripHtml(value) {
  return decodeHtmlEntities(
    String(value || '')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
}

function normalizeWhitespace(value) {
  return decodeHtmlEntities(String(value || ''))
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/^\n+|\n+$/g, '')
    .trim();
}

function normalizeText(value) {
  return normalizeWhitespace(stripHtml(value));
}

function removeDiacritics(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function compactKey(value) {
  return removeDiacritics(String(value || ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function truncate(value, maxLen) {
  const text = normalizeWhitespace(value);
  if (!maxLen || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim();
}

function unique(list) {
  return Array.from(new Set(list.filter(Boolean)));
}

function firstNonEmpty(values) {
  for (const value of values) {
    if (value && String(value).trim()) return String(value).trim();
  }
  return '';
}

function extractInsertValuesBlock(sql, tableName) {
  const marker = `INSERT INTO \`${tableName}\` VALUES`;
  const start = sql.indexOf(marker);
  if (start < 0) return null;

  const lineEnd = sql.indexOf('\n', start);
  if (lineEnd < 0) return null;

  const end = sql.indexOf(';\n', lineEnd + 1);
  if (end < 0) return null;

  return sql.slice(lineEnd + 1, end);
}

function decodeEscapedChar(ch) {
  switch (ch) {
    case 'n':
      return '\n';
    case 'r':
      return '\r';
    case 't':
      return '\t';
    case '0':
      return '\0';
    default:
      return ch;
  }
}

function parseSqlInsertRows(valuesBlock) {
  if (!valuesBlock) return [];

  const rows = [];
  const n = valuesBlock.length;
  let i = 0;

  const pushValue = (row, raw) => {
    const token = raw.trim();
    if (token === 'NULL') {
      row.push(null);
      return;
    }
    if (/^-?\d+$/.test(token)) {
      row.push(Number(token));
      return;
    }
    row.push(token);
  };

  while (i < n) {
    while (i < n && valuesBlock[i] !== '(') i++;
    if (i >= n) break;
    i++;

    const row = [];
    let token = '';
    let inString = false;
    let escaping = false;

    while (i < n) {
      const ch = valuesBlock[i];

      if (inString) {
        if (escaping) {
          token += decodeEscapedChar(ch);
          escaping = false;
          i++;
          continue;
        }
        if (ch === '\\') {
          escaping = true;
          i++;
          continue;
        }
        if (ch === "'") {
          inString = false;
          i++;
          continue;
        }
        token += ch;
        i++;
        continue;
      }

      if (ch === "'") {
        inString = true;
        i++;
        continue;
      }

      if (ch === ',') {
        pushValue(row, token);
        token = '';
        i++;
        continue;
      }

      if (ch === ')') {
        pushValue(row, token);
        token = '';
        rows.push(row);
        i++;
        break;
      }

      token += ch;
      i++;
    }

    while (i < n && /[\s,\r\n]/.test(valuesBlock[i])) i++;
  }

  return rows;
}

function detectWordpressPrefix(sql) {
  const match = sql.match(/INSERT INTO `([^`]+)posts` VALUES/i);
  if (!match) throw new Error('Could not detect WordPress table prefix in legacy SQL file.');
  return match[1];
}

function extractMapAddress(mapUrl) {
  if (!mapUrl) return '';

  const cleanUrl = decodeHtmlEntities(mapUrl);

  try {
    const parsed = new URL(cleanUrl);
    const q = parsed.searchParams.get('q');
    if (!q) return '';
    return normalizeWhitespace(decodeURIComponent(q.replace(/\+/g, ' ')));
  } catch {
    const match = cleanUrl.match(/[?&]q=([^&]+)/i);
    if (!match) return '';
    try {
      return normalizeWhitespace(decodeURIComponent(match[1].replace(/\+/g, ' ')));
    } catch {
      return normalizeWhitespace(match[1]);
    }
  }
}

function formatPhoneBr(digitsRaw) {
  const digits = String(digitsRaw || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4);
    const partA = digits.slice(4, 9);
    const partB = digits.slice(9);
    return `+55 (${ddd}) ${partA}-${partB}`;
  }

  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const partA = digits.slice(2, 7);
    const partB = digits.slice(7);
    return `(${ddd}) ${partA}-${partB}`;
  }

  return digitsRaw;
}

function buildH3Blocks(content) {
  const matches = [...content.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
  const blocks = [];

  for (let idx = 0; idx < matches.length; idx++) {
    const current = matches[idx];
    const start = (current.index ?? 0) + current[0].length;
    const nextH3 = idx + 1 < matches.length ? (matches[idx + 1].index ?? content.length) : content.length;

    let end = nextH3;
    const nextH2Relative = content.slice(start, nextH3).search(/<h2[^>]*>/i);
    if (nextH2Relative >= 0) end = Math.min(end, start + nextH2Relative);

    const title = normalizeText(current[1]).replace(/^[nN]\s+/, '');
    const desc = normalizeText(content.slice(start, end)).replace(/^[nN]\s+/, '');
    if (!title) continue;

    blocks.push({
      title: truncate(title, 180),
      description: truncate(desc, 900),
    });
  }

  return blocks;
}

function buildPageData(row) {
  const content = String(row?.[4] || '');
  const title = normalizeWhitespace(row?.[5] || '');
  const slug = normalizeWhitespace(row?.[11] || '');

  const paragraphs = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => normalizeText(m[1]))
    .filter(Boolean);

  const headings2 = [...content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((m) => normalizeText(m[1]))
    .filter(Boolean);

  const imageUrls = unique(
    [...content.matchAll(/<img[^>]+(?:data-image|src)="([^"]+)"/gi)]
      .map((m) => normalizeWhitespace(decodeHtmlEntities(m[1])))
      .filter(Boolean)
  );

  const mapUrl = normalizeWhitespace(
    decodeHtmlEntities(content.match(/<iframe[^>]+src="([^"]+)"/i)?.[1] || '')
  );
  const mapAddress = extractMapAddress(mapUrl);

  const phoneDigits = normalizeWhitespace(content.match(/wa\.me\/(\d+)/i)?.[1] || '');
  const phoneDisplay = normalizeWhitespace(
    headings2.find((h) => /\(\d{2}\)\s*\d{4,5}-\d{4}/.test(h)) || ''
  );
  const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : '';

  const facebook = normalizeWhitespace(
    content.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+/i)?.[0] || ''
  );
  const instagram = normalizeWhitespace(
    content.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s"'<>]+/i)?.[0] || ''
  );

  const textContent = normalizeText(content);
  const cnpj = normalizeWhitespace(textContent.match(/CNPJ\s*:?\s*([0-9./-]{14,18})/i)?.[1] || '');

  const logoImage = imageUrls.find((url) => /ores-logo/i.test(url)) || '';
  const qrImage = imageUrls.find((url) => /qr-code/i.test(url)) || '';
  const bannerImage = imageUrls.find((url) => /ores-(rio-de-janeiro|petropolis|regiao-dos-lagos)\.png/i.test(url))
    || imageUrls[0]
    || '';

  const galleryImages = imageUrls.filter(
    (url) => !/qr-code|ores-logo|ores-rio-de-janeiro\.png|ores-petropolis\.png|ores-regiao-dos-lagos\.png|\/rj-\d+x\d+\.png|\/petr-\d+x\d+\.png|\/rl-\d+x\d+\.png/i.test(url)
  );

  return {
    id: Number(row?.[0] || 0),
    title,
    slug,
    content,
    paragraphs,
    headings2,
    imageUrls,
    mapUrl,
    mapAddress,
    phoneDigits,
    phoneDisplay,
    whatsappUrl,
    facebook,
    instagram,
    cnpj,
    logoImage,
    qrImage,
    bannerImage,
    galleryImages,
    h3Blocks: buildH3Blocks(content),
  };
}

function findPage(pages, ...predicates) {
  for (const predicate of predicates) {
    const found = pages.find(predicate);
    if (found) return found;
  }
  return null;
}

function inferCity(page) {
  const slugKey = compactKey(page?.slug);
  const titleKey = compactKey(page?.title);

  if (slugKey.includes('riodejaneiro') || titleKey.includes('riodejaneiro')) return 'Rio de Janeiro';
  if (slugKey.includes('petropolis') || titleKey.includes('petropolis')) return 'Petropolis';
  if (slugKey.includes('lagos') || titleKey.includes('lagos')) return 'Regiao dos Lagos';
  return page?.title || '';
}

function inferUnitEmail(city) {
  const key = compactKey(city);
  if (key.includes('riodejaneiro')) return 'rj@ores.org.br';
  if (key.includes('petropolis')) return 'petropolis@ores.org.br';
  if (key.includes('lagos')) return 'lagos@ores.org.br';
  return 'contato@ores.org.br';
}

function fileTitleFromUrl(url) {
  if (!url) return '';
  const raw = decodeURIComponent(String(url).split('/').pop() || '');
  const noExt = raw.replace(/\.[a-z0-9]+$/i, '');
  return truncate(
    normalizeWhitespace(noExt.replace(/[-_]+/g, ' ')),
    120
  );
}

function buildLegacyPayload(sql) {
  const prefix = detectWordpressPrefix(sql);

  const optionsRows = parseSqlInsertRows(extractInsertValuesBlock(sql, `${prefix}options`));
  const postsRows = parseSqlInsertRows(extractInsertValuesBlock(sql, `${prefix}posts`));

  if (!postsRows.length) {
    throw new Error('No rows found for legacy WordPress posts table.');
  }

  const optionMap = new Map(optionsRows.map((row) => [String(row[1] || ''), decodeHtmlEntities(row[2] || '')]));
  const pages = postsRows.filter((row) => row[20] === 'page').map((row) => buildPageData(row));

  const pageHome = findPage(
    pages,
    (p) => compactKey(p.slug) === 'home',
    (p) => compactKey(p.title) === 'home'
  );

  const pageRio = findPage(
    pages,
    (p) => compactKey(p.slug).includes('riodejaneiro'),
    (p) => compactKey(p.title).includes('riodejaneiro')
  );

  const pagePet = findPage(
    pages,
    (p) => compactKey(p.slug).includes('orespetropolis'),
    (p) => compactKey(p.title).includes('petropolis')
  );

  const pageLagos = findPage(
    pages,
    (p) => compactKey(p.slug).includes('regiaodoslagos') || compactKey(p.slug).includes('regiaolagos'),
    (p) => compactKey(p.title).includes('lagos')
  );

  const regionalPages = unique([pageRio, pagePet, pageLagos].filter(Boolean));
  const orderedRegionals = regionalPages.map((page, idx) => ({ page, order: idx + 1 }));
  const allPreferredPages = [pageRio, pagePet, pageLagos, pageHome].filter(Boolean);

  const primaryPhoneDigits = firstNonEmpty(allPreferredPages.map((p) => p.phoneDigits));
  const primaryWhatsapp = firstNonEmpty(allPreferredPages.map((p) => p.whatsappUrl));
  const primaryPhoneDisplay = formatPhoneBr(
    firstNonEmpty([firstNonEmpty(allPreferredPages.map((p) => p.phoneDisplay)), primaryPhoneDigits])
  );

  const primaryFacebook = firstNonEmpty(allPreferredPages.map((p) => p.facebook));
  const primaryInstagram = firstNonEmpty(allPreferredPages.map((p) => p.instagram));
  const primaryMapUrl = firstNonEmpty(allPreferredPages.map((p) => p.mapUrl));
  const primaryAddress = firstNonEmpty(allPreferredPages.map((p) => p.mapAddress));
  const primaryLogo = firstNonEmpty(allPreferredPages.map((p) => p.logoImage));
  const primaryQr = firstNonEmpty(allPreferredPages.map((p) => p.qrImage));

  const cnpj = firstNonEmpty(allPreferredPages.map((p) => p.cnpj));
  const bankInfo = firstNonEmpty(
    allPreferredPages.flatMap((p) => p.headings2.filter((h) => /banco|agencia|conta/i.test(h)))
  );

  const petParagraphs = pagePet?.paragraphs || [];
  const rioParagraphs = pageRio?.paragraphs || [];
  const lagosParagraphs = pageLagos?.paragraphs || [];

  const homeRegionImages = pageHome?.imageUrls?.filter((u) => /\/(rj|petr|rl)-\d+x\d+\.png/i.test(u)) || [];
  const galleryImages = unique(
    [...(pageRio?.galleryImages || []), ...(pagePet?.galleryImages || []), ...(pageLagos?.galleryImages || [])]
  );

  const petProjects = (pagePet?.h3Blocks || [])
    .filter((item) => item.title && item.description)
    .map((item, idx) => ({
      name: truncate(item.title.replace(/^[nN]\s+/, ''), 200),
      category: /saude/i.test(item.title) ? 'Saude' : /arte|cultura/i.test(item.title) ? 'Cultura' : 'Projeto',
      description: truncate(item.description, 65000),
      coordinator: '',
      phone: primaryPhoneDisplay,
      meeting_day: '',
      meeting_time: '',
      location: 'ORES Petropolis',
      address: truncate(pagePet?.mapAddress || '', 300),
      map_url: pagePet?.mapUrl || '',
      image_url: pagePet?.galleryImages?.[idx] || pagePet?.bannerImage || '',
      display_order: idx + 1,
      active: 1,
    }));

  const espacoProjeto = {
    name: 'Espaco ORES',
    category: 'Acolhimento',
    description: truncate(
      [rioParagraphs[4], rioParagraphs[5], rioParagraphs[6]].filter(Boolean).join('\n\n')
      || firstNonEmpty(rioParagraphs),
      65000
    ),
    coordinator: '',
    phone: primaryPhoneDisplay,
    meeting_day: '',
    meeting_time: '',
    location: 'ORES Rio de Janeiro',
    address: truncate(pageRio?.mapAddress || '', 300),
    map_url: pageRio?.mapUrl || '',
    image_url: firstNonEmpty([pageRio?.galleryImages?.[0], pageRio?.bannerImage, pagePet?.bannerImage]),
    display_order: petProjects.length + 1,
    active: 1,
  };

  const projects = [...petProjects, espacoProjeto].filter((p) => p.name && p.description);

  const lagosServices = lagosParagraphs
    .filter((p) => p.includes(':'))
    .map((p) => {
      const idx = p.indexOf(':');
      return {
        title: truncate(p.slice(0, idx), 200),
        description: truncate(p.slice(idx + 1), 65535),
      };
    })
    .filter((item) => item.title && item.description);

  const petServices = petParagraphs
    .filter((p) => p.includes(':'))
    .map((p) => {
      const idx = p.indexOf(':');
      return {
        title: truncate(p.slice(0, idx), 200),
        description: truncate(p.slice(idx + 1), 65535),
      };
    })
    .filter((item) => item.title && item.description)
    .slice(0, 6);

  const socialServices = unique(
    [...lagosServices, ...petServices].map((item) => `${compactKey(item.title)}|${item.title}|${item.description}`)
  ).map((packed, idx) => {
    const [_idKey, title, description] = packed.split('|');
    return {
      title,
      description,
      icon: '',
      active: 1,
      display_order: idx + 1,
    };
  });

  const facilities = [
    {
      name: 'Unidade Rio de Janeiro',
      description: truncate(firstNonEmpty(rioParagraphs), 65535),
      icon: '',
      capacity: null,
      active: 1,
      display_order: 1,
    },
    {
      name: 'Unidade Petropolis',
      description: truncate(firstNonEmpty(petParagraphs), 65535),
      icon: '',
      capacity: null,
      active: 1,
      display_order: 2,
    },
    {
      name: 'Unidade Regiao dos Lagos',
      description: truncate(firstNonEmpty(lagosParagraphs), 65535),
      icon: '',
      capacity: null,
      active: 1,
      display_order: 3,
    },
  ];

  const regionals = orderedRegionals.map(({ page, order }) => {
    const city = inferCity(page);
    return {
      name: truncate(page.title || `ORES ${city}`, 200),
      city: truncate(city, 100),
      state: 'RJ',
      address: truncate(page.mapAddress || '', 300),
      phone: truncate(primaryPhoneDisplay, 30),
      email: truncate(inferUnitEmail(city), 255),
      coordinator: '',
      description: truncate(
        [page.paragraphs[0], page.paragraphs[1]].filter(Boolean).join('\n\n') || firstNonEmpty(page.paragraphs),
        65535
      ),
      image_url: truncate(page.bannerImage || '', 500),
      maps_url: truncate(page.mapUrl || '', 700),
      active: 1,
      display_order: order,
    };
  });

  const heroSlides = orderedRegionals.map(({ page, order }) => ({
    eyebrow: 'Unidades ORES',
    title: truncate(page.title || 'ORES', 300),
    subtitle: truncate(firstNonEmpty(page.paragraphs), 65535),
    image_url: truncate(page.bannerImage || page.imageUrls?.[0] || '', 500),
    primary_label: 'Conhecer unidade',
    primary_url: '/regionais',
    secondary_label: 'Fazer doacao',
    secondary_url: '#doacao',
    duration_ms: 6500,
    display_order: order,
    active: 1,
  }));

  const pastoralSlides = galleryImages.slice(0, 40).map((url, idx) => ({
    title: fileTitleFromUrl(url) || `Galeria ${idx + 1}`,
    subtitle: '',
    image_url: truncate(url, 500),
    display_order: idx + 1,
    active: 1,
  }));

  const missionText = firstNonEmpty([petParagraphs[0], rioParagraphs[0]]);
  const missionSupport = firstNonEmpty([petParagraphs[1], rioParagraphs[1]]);
  const missionExtra = firstNonEmpty([petParagraphs[2], rioParagraphs[2]]);

  const settings = {
    site_name: 'ORES',
    site_tagline: truncate(firstNonEmpty([optionMap.get('blogname'), 'Organizacao de Reintegracao e Estimulo a Socializacao']), 255),
    site_logo_url: truncate(primaryLogo, 700),
    site_address: truncate(firstNonEmpty([primaryAddress, 'Rio de Janeiro - RJ']), 700),
    site_email: truncate(firstNonEmpty([optionMap.get('admin_email'), 'contato@ores.org.br']), 255),
    site_whatsapp: truncate(primaryWhatsapp, 300),
    site_phone: truncate(primaryPhoneDisplay, 80),
    site_facebook: truncate(primaryFacebook, 300),
    site_instagram: truncate(primaryInstagram, 300),
    maps_url: truncate(primaryMapUrl, 700),

    hero_eyebrow: 'Bem-vindo a ORES',
    hero_title: 'Transformacao social com dignidade',
    hero_subtitle: truncate(missionText || 'A ORES atua na reintegracao e no cuidado social em comunidades vulneraveis.', 65535),
    hero_image_url: truncate(firstNonEmpty([pageHome?.imageUrls?.[0], pageRio?.bannerImage, pagePet?.bannerImage]), 700),
    hero_primary_label: 'Conheca a ORES',
    hero_primary_url: '/quem-somos',
    hero_secondary_label: 'Fale conosco',
    hero_secondary_url: '/contato',

    home_quick_title: 'Conheca nossas sedes',
    home_mission_eyebrow: 'Nossa missao',
    home_mission_title: 'Cuidar, incluir e transformar',
    home_mission_text: truncate([missionText, missionSupport].filter(Boolean).join('\n\n'), 65535),
    home_mission_primary_label: 'Saiba mais',
    home_mission_primary_url: '/quem-somos',
    home_mission_secondary_label: 'Seja voluntario',
    home_mission_secondary_url: '/voluntario',

    home_stat_1_value: String(regionals.length || 3),
    home_stat_1_suffix: '',
    home_stat_1_label: 'Unidades',
    home_stat_1_no_count: '0',
    home_stat_2_value: String(projects.length || 4),
    home_stat_2_suffix: '+',
    home_stat_2_label: 'Projetos',
    home_stat_2_no_count: '0',
    home_stat_3_value: String(socialServices.length || 4),
    home_stat_3_suffix: '+',
    home_stat_3_label: 'Servicos',
    home_stat_3_no_count: '0',
    home_stat_4_value: cnpj ? '1' : '0',
    home_stat_4_suffix: '',
    home_stat_4_label: 'CNPJ ativo',
    home_stat_4_no_count: '1',

    donation_enabled: '1',
    donation_eyebrow: 'Apoie nossa causa',
    donation_title: 'Faca sua doacao via PIX',
    donation_text: truncate(
      [firstNonEmpty(allPreferredPages.map((p) => p.headings2.find((h) => /doacao|pix/i.test(h)))), bankInfo]
        .filter(Boolean)
        .join('\n\n'),
      65535
    ),
    donation_pix_key: truncate(cnpj, 255),
    donation_background_url: truncate(firstNonEmpty([pageRio?.bannerImage, pagePet?.bannerImage, homeRegionImages[0]]), 700),
    donation_qr_url: truncate(primaryQr, 700),
    donation_button_label: 'Copiar chave PIX',
    donation_gallery_1_url: truncate(galleryImages[0] || '', 700),
    donation_gallery_1_caption: 'Acoes sociais da ORES',
    donation_gallery_2_url: truncate(galleryImages[1] || '', 700),
    donation_gallery_2_caption: 'Projetos com a comunidade',
    donation_gallery_3_url: truncate(galleryImages[2] || '', 700),
    donation_gallery_3_caption: 'Impacto em campo',

    quem_somos_eyebrow: 'Sobre a ORES',
    quem_somos_title: 'Quem somos',
    quem_somos_subtitle: truncate(missionText, 65535),
    quem_somos_image_url: truncate(firstNonEmpty([pagePet?.bannerImage, pageRio?.bannerImage]), 700),
    quem_somos_history_title: 'Nossa historia e missao',
    quem_somos_history_text_1: truncate(missionSupport, 65535),
    quem_somos_history_text_2: truncate([missionExtra, petParagraphs[3], petParagraphs[4]].filter(Boolean).join('\n\n'), 65535),

    voluntario_eyebrow: 'Voluntariado',
    voluntario_title: 'Quero ser voluntario',
    voluntario_subtitle: 'Junte-se a ORES e participe da transformacao social.',
    voluntario_image_url: truncate(firstNonEmpty([galleryImages[3], pageRio?.bannerImage]), 700),
    voluntario_cta_title: 'Faca parte da mudanca',
    voluntario_cta_text: 'Entre em contato com nossa equipe para conhecer oportunidades de voluntariado nas unidades da ORES.',
    voluntario_cta_label: 'Entrar em contato',
    voluntario_cta_url: '/contato',

    obra_social_eyebrow: 'Programas',
    obra_social_title: 'Programas sociais da ORES',
    obra_social_subtitle: 'Acoes de cuidado, cidadania e inclusao social.',
    obra_social_image_url: truncate(firstNonEmpty([pageLagos?.bannerImage, pageRio?.bannerImage]), 700),
    obra_social_mission_title: 'Nossa atuacao social',
    obra_social_mission_text: truncate([lagosParagraphs[0], lagosParagraphs[1], lagosParagraphs[2]].filter(Boolean).join('\n\n'), 65535),
    obra_social_cta_label: 'Seja voluntario',
    obra_social_cta_url: '/voluntario',

    programas_eyebrow: 'Programas',
    programas_title: 'Programas sociais da ORES',
    programas_subtitle: 'Acoes de cuidado, cidadania e inclusao social.',
    programas_image_url: truncate(firstNonEmpty([pageLagos?.bannerImage, pageRio?.bannerImage]), 700),
    programas_mission_title: 'Nossa atuacao social',
    programas_mission_text: truncate([lagosParagraphs[0], lagosParagraphs[1], lagosParagraphs[2]].filter(Boolean).join('\n\n'), 65535),
    programas_cta_label: 'Seja voluntario',
    programas_cta_url: '/voluntario',

    regionais_eyebrow: 'Nossa presenca',
    regionais_title: 'Unidades regionais',
    regionais_subtitle: 'Conheca as unidades da ORES no Rio de Janeiro, Petropolis e Regiao dos Lagos.',
    regionais_image_url: truncate(firstNonEmpty([homeRegionImages[0], pageRio?.bannerImage]), 700),
    regionais_page_image_url: truncate(firstNonEmpty([homeRegionImages[0], pageRio?.bannerImage]), 700),

    projetos_eyebrow: 'Iniciativas',
    projetos_title: 'Projetos da ORES',
    projetos_subtitle: 'Conheca os projetos e frentes que realizamos nas comunidades.',
    projetos_image_url: truncate(firstNonEmpty([pagePet?.bannerImage, galleryImages[0]]), 700),

    espaco_ores_eyebrow: 'Espaco ORES',
    espaco_ores_title: 'Espaco ORES',
    espaco_ores_subtitle: truncate([rioParagraphs[4], rioParagraphs[5]].filter(Boolean).join('\n\n'), 65535),
    espaco_ores_image_url: truncate(firstNonEmpty([pageRio?.galleryImages?.[0], pageRio?.bannerImage]), 700),

    news_image_url: truncate(firstNonEmpty([galleryImages[0], pagePet?.bannerImage]), 700),
    contact_image_url: truncate(firstNonEmpty([galleryImages[1], pageRio?.bannerImage]), 700),
    calendar_image_url: truncate(firstNonEmpty([galleryImages[2], pageLagos?.bannerImage]), 700),
    programs_image_url: truncate(firstNonEmpty([pageLagos?.bannerImage, pageRio?.bannerImage]), 700),
    courses_image_url: truncate(firstNonEmpty([galleryImages[4], pagePet?.bannerImage]), 700),
    projects_image_url: truncate(firstNonEmpty([pagePet?.bannerImage, galleryImages[5]]), 700),
  };

  return {
    meta: {
      prefix,
      pagesFound: pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug, contentLen: p.content.length })),
    },
    settings,
    heroSlides,
    regionals,
    projects,
    pastoralSlides,
    facilities,
    socialServices,
  };
}

function resolveLegacySqlPath() {
  const candidates = unique([
    process.env.LEGACY_SQL_PATH,
    path.resolve(process.cwd(), '../oressite/docker-local/site/www/backup/sqldump.sql'),
    path.resolve(process.cwd(), '../../oressite/docker-local/site/www/backup/sqldump.sql'),
    path.resolve(process.cwd(), 'oressite/docker-local/site/www/backup/sqldump.sql'),
    path.resolve(process.cwd(), '../oressite/ores01_extracted.sql'),
  ]);

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    'Legacy SQL file not found. Set LEGACY_SQL_PATH or keep oressite backup folder beside this repo.'
  );
}

async function tableCount(conn, tableName) {
  const [rows] = await conn.execute(`SELECT COUNT(*) AS n FROM \`${tableName}\``);
  return Number(rows?.[0]?.n || 0);
}

async function upsertSettings(conn, settings) {
  const entries = Object.entries(settings).filter(([, value]) => value !== undefined && value !== null);
  for (const [key, value] of entries) {
    await conn.execute(
      `INSERT INTO site_settings (\`key\`, value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [key, String(value)]
    );
  }
}

async function replaceRowsIfNeeded(conn, tableName, rows, overwrite, insertFn) {
  if (!rows.length) {
    console.log(`Skipping ${tableName}: no legacy rows.`);
    return;
  }

  const currentCount = await tableCount(conn, tableName);
  if (!overwrite && currentCount > 0) {
    console.log(`Skipping ${tableName}: table already has ${currentCount} rows (use --overwrite to replace).`);
    return;
  }

  if (overwrite) {
    await conn.execute(`DELETE FROM \`${tableName}\``);
  }

  for (const row of rows) {
    await insertFn(row);
  }

  const finalCount = await tableCount(conn, tableName);
  console.log(`Imported ${tableName}: ${finalCount} rows.`);
}

async function run() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const overwrite = args.has('--overwrite');

  const sqlPath = resolveLegacySqlPath();
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const payload = buildLegacyPayload(sql);

  console.log(`Legacy source: ${sqlPath}`);
  console.log(`Prefix detected: ${payload.meta.prefix}`);
  console.log(`Pages found: ${payload.meta.pagesFound.length}`);
  for (const page of payload.meta.pagesFound) {
    console.log(`  - [${page.id}] ${page.title} (${page.slug}) len=${page.contentLen}`);
  }

  console.log('\nPayload summary');
  console.log(`  settings: ${Object.keys(payload.settings).length}`);
  console.log(`  hero_slides: ${payload.heroSlides.length}`);
  console.log(`  regional_units: ${payload.regionals.length}`);
  console.log(`  pastorals: ${payload.projects.length}`);
  console.log(`  pastoral_slides: ${payload.pastoralSlides.length}`);
  console.log(`  facilities: ${payload.facilities.length}`);
  console.log(`  social_services: ${payload.socialServices.length}`);

  if (dryRun) {
    console.log('\nDry run complete. No database changes were made.');
    await pool.end();
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await upsertSettings(conn, payload.settings);
    console.log(`Upserted site_settings: ${Object.keys(payload.settings).length} keys.`);

    await replaceRowsIfNeeded(conn, 'hero_slides', payload.heroSlides, overwrite, async (row) => {
      await conn.execute(
        `INSERT INTO hero_slides
        (eyebrow, title, subtitle, image_url, primary_label, primary_url, secondary_label, secondary_url, duration_ms, display_order, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.eyebrow,
          row.title,
          row.subtitle,
          row.image_url,
          row.primary_label,
          row.primary_url,
          row.secondary_label,
          row.secondary_url,
          row.duration_ms,
          row.display_order,
          row.active,
        ]
      );
    });

    await replaceRowsIfNeeded(conn, 'regional_units', payload.regionals, overwrite, async (row) => {
      await conn.execute(
        `INSERT INTO regional_units
        (name, city, state, address, phone, email, coordinator, description, image_url, maps_url, active, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.name,
          row.city,
          row.state,
          row.address,
          row.phone,
          row.email,
          row.coordinator,
          row.description,
          row.image_url,
          row.maps_url,
          row.active,
          row.display_order,
        ]
      );
    });

    await replaceRowsIfNeeded(conn, 'pastorals', payload.projects, overwrite, async (row) => {
      await conn.execute(
        `INSERT INTO pastorals
        (name, category, description, coordinator, phone, meeting_day, meeting_time, location, address, map_url, image_url, active, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.name,
          row.category,
          row.description,
          row.coordinator,
          row.phone,
          row.meeting_day,
          row.meeting_time,
          row.location,
          row.address,
          row.map_url,
          row.image_url,
          row.active,
          row.display_order,
        ]
      );
    });

    await replaceRowsIfNeeded(conn, 'pastoral_slides', payload.pastoralSlides, overwrite, async (row) => {
      await conn.execute(
        `INSERT INTO pastoral_slides
        (title, subtitle, image_url, display_order, active)
        VALUES (?, ?, ?, ?, ?)`,
        [row.title, row.subtitle, row.image_url, row.display_order, row.active]
      );
    });

    await replaceRowsIfNeeded(conn, 'facilities', payload.facilities, overwrite, async (row) => {
      await conn.execute(
        `INSERT INTO facilities
        (name, description, icon, capacity, active, display_order)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [row.name, row.description, row.icon, row.capacity, row.active, row.display_order]
      );
    });

    await replaceRowsIfNeeded(conn, 'social_services', payload.socialServices, overwrite, async (row) => {
      await conn.execute(
        `INSERT INTO social_services
        (title, description, icon, active, display_order)
        VALUES (?, ?, ?, ?, ?)`,
        [row.title, row.description, row.icon, row.active, row.display_order]
      );
    });

    await conn.commit();
    console.log('\nLegacy import completed successfully.');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Legacy import failed:', err?.message || err);
  process.exit(1);
});
