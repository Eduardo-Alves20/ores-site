import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Each variant: target size + crop strategy.
// `position: 'attention'` makes sharp pick the most "interesting" region
// (using entropy/edge detection) rather than a blind center crop.
// Quality bumped to ~88 — these are banners, the extra ~20% bytes is worth it.
export const VARIANTS = {
  hero:   { width: 1920, height: 1080, fit: 'cover', position: 'attention', quality: 88 },
  mobile: { width: 1080, height: 1350, fit: 'cover', position: 'attention', quality: 86 },
  card:   { width: 800,  height: 600,  fit: 'cover', position: 'attention', quality: 84 },
  thumb:  { width: 400,  height: 400,  fit: 'cover', position: 'attention', quality: 82 },
};

// Skip variants for animated formats (we'd lose the animation) and SVG (vector).
const SKIPPABLE_EXTS = new Set(['.gif', '.svg']);

/**
 * Generate WebP variants beside the original.
 * Original "/uploads/foo.jpg" yields:
 *   "/uploads/foo.hero.webp", "foo.mobile.webp", "foo.card.webp", "foo.thumb.webp"
 *
 * Safe to call repeatedly — existing variants are skipped unless force=true.
 * Failures on individual variants are logged but never thrown to the caller,
 * because the original file is still usable.
 */
export async function processImage(filePath, { force = false } = {}) {
  if (!fs.existsSync(filePath)) {
    return { skipped: true, reason: 'missing' };
  }

  const ext = path.extname(filePath).toLowerCase();
  if (SKIPPABLE_EXTS.has(ext)) {
    return { skipped: true, reason: 'unsupported-format' };
  }

  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ext);
  const generated = [];
  const errors = [];

  // Process each variant serially to avoid memory spikes on small containers.
  for (const [name, opts] of Object.entries(VARIANTS)) {
    const outPath = path.join(dir, `${base}.${name}.webp`);
    if (!force && fs.existsSync(outPath)) continue;

    try {
      await sharp(filePath, { failOn: 'truncated' })
        .rotate() // auto-orient based on EXIF
        .resize({
          width: opts.width,
          height: opts.height,
          fit: opts.fit,
          position: opts.position,
          // Don't upscale small originals — interpolation + WebP re-encode
          // makes phone photos look mushy. Sharp keeps the original size
          // when source is smaller; CSS handles final display scaling.
          withoutEnlargement: true,
        })
        // effort=6 (max) gives ~10% better compression at the cost of CPU,
        // which is fine for upload-time processing.
        .webp({ quality: opts.quality, effort: 6 })
        .toFile(outPath);
      generated.push(name);
    } catch (err) {
      errors.push({ variant: name, message: err.message });
      console.warn(`[imageProcessor] ${base} ${name} failed:`, err.message);
    }
  }

  return { skipped: false, generated, errors };
}

/**
 * Process all images in a directory that don't yet have variants.
 * Used by the one-shot reprocess script and at startup.
 */
export async function reprocessDirectory(dir, { force = false } = {}) {
  if (!fs.existsSync(dir)) return { processed: 0, total: 0 };

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const originals = entries.filter((e) => {
    if (!e.isFile()) return false;
    const ext = path.extname(e.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return false;
    // Skip files that are themselves variants (foo.hero.webp etc)
    const base = path.basename(e.name, ext);
    return !/\.(hero|mobile|card|thumb)$/.test(base);
  });

  let processed = 0;
  for (const entry of originals) {
    const full = path.join(dir, entry.name);
    const res = await processImage(full, { force });
    if (!res.skipped && res.generated?.length) processed += 1;
  }

  return { processed, total: originals.length };
}
