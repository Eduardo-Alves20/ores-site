import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { securityHeaders, globalRateLimit, sanitizeRequest } from './middleware/security.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

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
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(compression());

// ── Logging ──────────────────────────────────────────────────────────────────
if (isDev) app.use(morgan('dev'));

// ── Global rate limit + sanitizer ────────────────────────────────────────────
app.use(globalRateLimit);
app.use(sanitizeRequest);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Serve React build (production) ───────────────────────────────────────────
const frontendBuild = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuild, { maxAge: '7d', etag: true }));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada.' });
  }
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: isDev ? err.message : 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`PES Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;
