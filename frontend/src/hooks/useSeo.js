import { useEffect } from 'react';

const SITE_NAME = 'ORES';
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://oresong.com';

function upsertMeta(selector, attr, name, content) {
  if (content === undefined || content === null) return;
  let el = document.head.querySelector(`meta[${selector}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Updates document.title and the relevant SEO meta tags per page.
 * Call once near the top of a page component.
 *
 *   useSeo({
 *     title: 'Quem Somos',
 *     description: 'Conheça a história da ORES e seus projetos sociais...',
 *   });
 *
 * The title is automatically appended with ' | ORES' unless you pass
 * `suffix: false`.
 */
export function useSeo({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  suffix = true,
} = {}) {
  useEffect(() => {
    const fullTitle = title
      ? (suffix ? `${title} | ${SITE_NAME}` : title)
      : 'ORES - ONG Organização de Reintegração e Estímulo Social';

    document.title = fullTitle;

    const canonical = url || (typeof window !== 'undefined' ? window.location.href.split('#')[0].split('?')[0] : ORIGIN);

    if (description) {
      upsertMeta('name', 'name', 'description', description);
      upsertMeta('property', 'property', 'og:description', description);
      upsertMeta('name', 'name', 'twitter:description', description);
    }
    if (keywords) upsertMeta('name', 'name', 'keywords', keywords);

    upsertMeta('property', 'property', 'og:title', fullTitle);
    upsertMeta('name', 'name', 'twitter:title', fullTitle);
    upsertMeta('property', 'property', 'og:url', canonical);
    upsertMeta('property', 'property', 'og:type', type);

    if (image) {
      const absImage = image.startsWith('http') ? image : `${ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`;
      upsertMeta('property', 'property', 'og:image', absImage);
      upsertMeta('name', 'name', 'twitter:image', absImage);
    }

    upsertLink('canonical', canonical);
  }, [title, description, keywords, image, url, type, suffix]);
}
