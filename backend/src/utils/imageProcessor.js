import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { variantsDirFor, originalsDir } from './uploads.js';

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
 * Generate WebP variants for one original image.
 *
 * Layout produced (uploadsDir is the root):
 *   originals/<base>.<ext>           (already exists; this is the input)
 *   variants/<base>/hero.webp
 *   variants/<base>/mobile.webp
 *   variants/<base>/card.webp
 *   variants/<base>/thumb.webp
 *
 * Safe to call repeatedly — existing variant files are skipped unless force=true.
 * Failures on individual variants are logged but never thrown to the caller,
 * because the original file is still usable as a fallback.
 */
export async function processImage(filePath, { force = false } = {}) {
  if (!fs.existsSync(filePath)) {
    return { skipped: true, reason: 'missing' };
  }

  const ext = path.extname(filePath).toLowerCase();
  if (SKIPPABLE_EXTS.has(ext)) {
    return { skipped: true, reason: 'unsupported-format' };
  }

  const filename = path.basename(filePath);
  const variantDir = variantsDirFor(filename);
  fs.mkdirSync(variantDir, { recursive: true });

  const generated = [];
  const errors = [];

  // Process each variant serially to avoid memory spikes on small containers.
  for (const [name, opts] of Object.entries(VARIANTS)) {
    const outPath = path.join(variantDir, `${name}.webp`);
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
      console.warn(`[imageProcessor] ${filename} ${name} failed:`, err.message);
    }
  }

  return { skipped: false, generated, errors };
}

/**
 * Process every image found in the originals directory that does not yet
 * have a complete variant set. Used by the one-shot reprocess script.
 */
export async function reprocessAll({ force = false } = {}) {
  if (!fs.existsSync(originalsDir)) return { processed: 0, total: 0 };

  const entries = fs.readdirSync(originalsDir, { withFileTypes: true });
  const originals = entries.filter((e) => {
    if (!e.isFile()) return false;
    const ext = path.extname(e.name).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  let processed = 0;
  for (const entry of originals) {
    const full = path.join(originalsDir, entry.name);
    const res = await processImage(full, { force });
    if (!res.skipped && res.generated?.length) processed += 1;
  }

  return { processed, total: originals.length };
}
