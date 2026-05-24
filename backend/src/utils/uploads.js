import path from 'path';
import fs from 'fs';

function resolveUploadsDir() {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), 'uploads');
}

export const uploadsDir = resolveUploadsDir();
export const originalsDir = path.join(uploadsDir, 'originals');
export const variantsDir = path.join(uploadsDir, 'variants');

// Ensure structure exists at module load — cheap and idempotent.
fs.mkdirSync(originalsDir, { recursive: true });
fs.mkdirSync(variantsDir, { recursive: true });

/**
 * For an original filename like "abc.jpg", returns the per-image variant
 * subdirectory path: ".../uploads/variants/abc/".
 * The directory is NOT created here — callers do that when writing.
 */
export function variantsDirFor(originalFilename) {
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext);
  return path.join(variantsDir, base);
}

export function syncLegacyUploads() {
  const legacyDir = path.resolve(process.cwd(), 'backend/public/uploads');
  if (!fs.existsSync(legacyDir)) return { copied: 0, skipped: 0 };
  if (path.resolve(legacyDir) === path.resolve(uploadsDir)) return { copied: 0, skipped: 0 };

  fs.mkdirSync(uploadsDir, { recursive: true });

  let copied = 0;
  let skipped = 0;
  const entries = fs.readdirSync(legacyDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const src = path.join(legacyDir, entry.name);
    const dest = path.join(uploadsDir, entry.name);
    if (fs.existsSync(dest)) {
      skipped += 1;
      continue;
    }
    try {
      fs.copyFileSync(src, dest);
      copied += 1;
    } catch {
      skipped += 1;
    }
  }
  return { copied, skipped };
}
