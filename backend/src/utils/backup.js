import fs from 'fs';
import path from 'path';

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseTargets(defaultUploadsDir) {
  const raw = process.env.BACKUP_PATHS?.trim();
  const values = raw
    ? raw.split(',').map((item) => item.trim()).filter(Boolean)
    : [defaultUploadsDir];
  return [...new Set(values.map((p) => (path.isAbsolute(p) ? p : path.resolve(process.cwd(), p))))];
}

function formatStamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function pruneOldBackups(rootDir, keepDays) {
  const limit = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  const entries = fs.readdirSync(rootDir, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const entry of entries) {
    const full = path.join(rootDir, entry.name);
    const stat = fs.statSync(full);
    if (stat.mtimeMs < limit) {
      fs.rmSync(full, { recursive: true, force: true });
    }
  }
}

export function runStartupBackup(defaultUploadsDir) {
  const enabled = toBool(process.env.BACKUP_ENABLED, process.env.NODE_ENV === 'production');
  if (!enabled) return { ran: false, reason: 'disabled' };

  const rootDir = process.env.BACKUP_DIR?.trim()
    ? (path.isAbsolute(process.env.BACKUP_DIR) ? process.env.BACKUP_DIR : path.resolve(process.cwd(), process.env.BACKUP_DIR))
    : path.resolve(process.cwd(), 'backups');
  const keepDays = Math.max(parseInt(process.env.BACKUP_KEEP_DAYS || '14', 10) || 14, 1);
  const minHours = Math.max(parseInt(process.env.BACKUP_MIN_INTERVAL_HOURS || '6', 10) || 6, 0);

  fs.mkdirSync(rootDir, { recursive: true });

  const stampFile = path.join(rootDir, '.last_backup_at');
  if (minHours > 0 && fs.existsSync(stampFile)) {
    const last = Number(fs.readFileSync(stampFile, 'utf-8')) || 0;
    if (Date.now() - last < minHours * 60 * 60 * 1000) {
      return { ran: false, reason: 'interval', rootDir };
    }
  }

  const targets = parseTargets(defaultUploadsDir);
  const snapshotDir = path.join(rootDir, formatStamp());
  fs.mkdirSync(snapshotDir, { recursive: true });

  let copied = 0;
  let skipped = 0;

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      skipped += 1;
      continue;
    }
    const baseName = path.basename(target);
    const destination = path.join(snapshotDir, baseName);
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      fs.cpSync(target, destination, { recursive: true, force: false, errorOnExist: false });
      copied += 1;
    } else if (stat.isFile()) {
      fs.copyFileSync(target, destination);
      copied += 1;
    } else {
      skipped += 1;
    }
  }

  fs.writeFileSync(stampFile, String(Date.now()));
  pruneOldBackups(rootDir, keepDays);

  return { ran: true, rootDir, snapshotDir, copied, skipped };
}

