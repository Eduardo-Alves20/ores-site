// One-shot migration: flat /uploads/* -> /uploads/originals/ + /uploads/variants/<base>/
//
//   Before:
//     uploads/abc.jpg
//     uploads/abc.hero.webp
//     uploads/abc.mobile.webp
//     uploads/abc.card.webp
//     uploads/abc.thumb.webp
//
//   After:
//     uploads/originals/abc.jpg
//     uploads/variants/abc/hero.webp
//     uploads/variants/abc/mobile.webp
//     uploads/variants/abc/card.webp
//     uploads/variants/abc/thumb.webp
//
// Run inside the backend container after deploying the new layout code:
//   docker exec ores-site-backend-1 node /app/backend/src/scripts/migrateUploadsStructure.js
//
// Safe to run multiple times — already-migrated files and DB rows are skipped.
import fs from 'fs';
import path from 'path';
import { query } from '../database/connection.js';
import { uploadsDir, originalsDir, variantsDir } from '../utils/uploads.js';

const VARIANT_PATTERN = /^(.+)\.(hero|mobile|card|thumb)\.webp$/i;
const ORIGINAL_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function moveFile(src, dest) {
  if (fs.existsSync(dest)) {
    // Destination already exists — drop the duplicate source to avoid orphans
    fs.unlinkSync(src);
    return 'duplicate';
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  return 'moved';
}

async function migrateFiles() {
  fs.mkdirSync(originalsDir, { recursive: true });
  fs.mkdirSync(variantsDir, { recursive: true });

  const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
  let originals = 0;
  let variants = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const src = path.join(uploadsDir, entry.name);

    const variantMatch = entry.name.match(VARIANT_PATTERN);
    if (variantMatch) {
      const [, base, variantName] = variantMatch;
      const dest = path.join(variantsDir, base, `${variantName.toLowerCase()}.webp`);
      const result = moveFile(src, dest);
      if (result === 'moved') variants += 1; else skipped += 1;
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (ORIGINAL_EXTS.has(ext)) {
      const dest = path.join(originalsDir, entry.name);
      const result = moveFile(src, dest);
      if (result === 'moved') originals += 1; else skipped += 1;
    }
  }

  return { originals, variants, skipped };
}

async function migrateDb() {
  const tables = ['hero_slides', 'pastoral_slides', 'program_slides', 'pastorals', 'news', 'regional_units'];
  let updated = 0;

  for (const table of tables) {
    const r = await query(
      `UPDATE \`${table}\`
         SET image_url = REPLACE(image_url, '/uploads/', '/uploads/originals/')
       WHERE image_url LIKE '/uploads/%'
         AND image_url NOT LIKE '/uploads/originals/%'
         AND image_url NOT LIKE '/uploads/variants/%'`
    );
    updated += r.affectedRows || 0;
  }

  // site_settings stores image URLs in the generic `value` column
  const r2 = await query(
    `UPDATE site_settings
       SET value = REPLACE(value, '/uploads/', '/uploads/originals/')
     WHERE value LIKE '/uploads/%'
       AND value NOT LIKE '/uploads/originals/%'
       AND value NOT LIKE '/uploads/variants/%'`
  );
  updated += r2.affectedRows || 0;

  return updated;
}

console.log('Migrating uploads structure...');
console.time('done');

const fileResult = await migrateFiles();
console.log(`Originals moved: ${fileResult.originals}`);
console.log(`Variants moved:  ${fileResult.variants}`);
console.log(`Already in place / duplicate: ${fileResult.skipped}`);

const dbResult = await migrateDb();
console.log(`Database rows updated: ${dbResult}`);

console.timeEnd('done');
process.exit(0);
