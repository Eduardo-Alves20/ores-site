import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

import { securityHeaders, globalRateLimit, sanitizeRequest } from './middleware/security.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhook.js';
import { uploadsDir, syncLegacyUploads } from './utils/uploads.js';
import { ensureRuntimeSchema } from './database/runtimeSchema.js';
import { runStartupBackup } from './utils/backup.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';
fs.mkdirSync(uploadsDir, { recursive: true });
const uploadStaticDirs = [
  uploadsDir,
  path.resolve(process.cwd(), 'uploads'),
  path.resolve(process.cwd(), 'backend/public/uploads'),
  path.resolve(__dirname, '../../uploads'),
]
  .map((dir) => path.resolve(dir))
  .filter((dir, index, all) => all.indexOf(dir) === index && fs.existsSync(dir));

// ── Trust proxy (Hostinger / nginx) ─────────────────────────────────────────
app.set('trust proxy', 1);

// ── Security headers ─────────────────────────────────────────────────────────
app.use(securityHeaders);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: isDev
    ? ['http://localhost:5173', 'http://localhost:3000']
    : [process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
// JSON limit stays small — uploads use multipart, not JSON
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(compression());

// ── Logging ──────────────────────────────────────────────────────────────────
if (isDev) app.use(morgan('dev'));

// ── Global rate limit + sanitizer ────────────────────────────────────────────
app.use(globalRateLimit);
app.use(sanitizeRequest);
for (const dir of uploadStaticDirs) {
  app.use('/uploads', express.static(dir, { maxAge: '30d', etag: true }));
}
app.use('/uploads', (_req, res) => {
  res.status(404).type('text/plain').send('Arquivo nao encontrado.');
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/webhook', webhookRoutes);   // PUBLIC – no auth (PayPal IPN)
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Serve React build (production) ───────────────────────────────────────────
const frontendBuild = path.join(__dirname, '../../frontend/dist');
app.use('/assets', express.static(path.join(frontendBuild, 'assets'), {
  maxAge: '30d',
  etag: true,
  immutable: true,
}));
app.use(express.static(frontendBuild, {
  maxAge: 0,
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada.' });
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: isDev ? err.message : 'Erro interno do servidor.' });
});

async function startServer() {
  const sync = syncLegacyUploads();
  if (sync.copied > 0) {
    console.log(`Legacy uploads synced: ${sync.copied} copied, ${sync.skipped} skipped`);
  }
  const backup = runStartupBackup(uploadsDir);
  if (backup.ran) {
    console.log(`Backup snapshot created at ${backup.snapshotDir} (${backup.copied} copied, ${backup.skipped} skipped)`);
  } else if (backup.reason === 'interval') {
    console.log(`Backup skipped (interval): ${backup.rootDir}`);
  }
  await ensureRuntimeSchema();
  app.listen(PORT, () => {
    console.log(`Site server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();

export default app;
