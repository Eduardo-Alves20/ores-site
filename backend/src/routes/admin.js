import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import { authRateLimit, authSlowDown, noCache } from '../middleware/security.js';
import * as auth from '../controllers/authController.js';
import * as adm from '../controllers/adminController.js';

const router = Router();

// All admin routes: no-cache headers
router.use(noCache);

// ── Auth (public within admin namespace) ─────────────────────────────────────
router.post('/auth/login', authRateLimit, authSlowDown, [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').isLength({ min: 1 }).withMessage('Senha obrigatória.'),
  validateRequest,
], auth.login);

router.post('/auth/refresh', auth.refresh);

// All routes below require auth
router.use(requireAuth);

router.post('/auth/logout', auth.logout);
router.get('/auth/me', auth.me);
router.post('/auth/change-password', [
  body('currentPassword').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 8 }).withMessage('Nova senha deve ter pelo menos 8 caracteres.'),
  validateRequest,
], auth.changePassword);

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', adm.getDashboardStats);

// ── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', adm.getSettings);
router.put('/settings', adm.updateSettings);
router.post('/media', adm.uploadMedia);

router.get('/hero-slides', adm.listHeroSlides);
router.post('/hero-slides', [
  body('title').trim().isLength({ min: 3 }),
  validateRequest,
], adm.createHeroSlide);
router.put('/hero-slides/:id', adm.updateHeroSlide);
router.delete('/hero-slides/:id', adm.deleteHeroSlide);

// ── Events ───────────────────────────────────────────────────────────────────
router.get('/events', adm.listEvents);
router.post('/events', [
  body('title').trim().isLength({ min: 3 }),
  body('event_date').isDate(),
  validateRequest,
], adm.createEvent);
router.put('/events/:id', adm.updateEvent);
router.delete('/events/:id', adm.deleteEvent);

// ── News ─────────────────────────────────────────────────────────────────────
router.get('/news', adm.listNews);
router.post('/news', [
  body('title').trim().isLength({ min: 3 }),
  body('slug').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
  validateRequest,
], adm.createNews);
router.put('/news/:id', adm.updateNews);
router.delete('/news/:id', adm.deleteNews);

// ── Regional Units ────────────────────────────────────────────────────────────
router.get('/regionais', adm.listRegionais);
router.post('/regionais', [
  body('name').trim().isLength({ min: 3 }),
  body('city').trim().isLength({ min: 2 }),
  validateRequest,
], adm.createRegional);
router.put('/regionais/:id', adm.updateRegional);
router.delete('/regionais/:id', adm.deleteRegional);

// ── Projects (pastorals table) ────────────────────────────────────────────────
router.get('/projetos', adm.listPastorals);
router.post('/projetos', adm.createPastoral);
router.put('/projetos/:id', adm.updatePastoral);
router.delete('/projetos/:id', adm.deletePastoral);
router.get('/projeto-slides', adm.listPastoralSlides);
router.post('/projeto-slides', adm.createPastoralSlide);
router.put('/projeto-slides/:id', adm.updatePastoralSlide);
router.delete('/projeto-slides/:id', adm.deletePastoralSlide);

// ── Facilities (Espaço ORES) ──────────────────────────────────────────────────
router.get('/facilities', adm.listFacilities);
router.post('/facilities', adm.createFacility);
router.put('/facilities/:id', adm.updateFacility);
router.delete('/facilities/:id', adm.deleteFacility);

// ── Courses ──────────────────────────────────────────────────────────────────
router.get('/courses', adm.listCourses);
router.post('/courses', adm.createCourse);
router.put('/courses/:id', adm.updateCourse);
router.delete('/courses/:id', adm.deleteCourse);

// ── Social programs ───────────────────────────────────────────────────────────
router.get('/services', adm.listServices);
router.post('/services', adm.createService);
router.put('/services/:id', adm.updateService);
router.delete('/services/:id', adm.deleteService);

// ── Messages ──────────────────────────────────────────────────────────────────
router.get('/messages', adm.listMessages);
router.put('/messages/:id/read', adm.markMessageRead);
router.delete('/messages/:id', adm.deleteMessage);

// ── Donations ────────────────────────────────────────────────────────────────
router.get('/doacoes/stats', adm.getDonationStats);
router.get('/doacoes', adm.listDonations);

// ── Audit log ────────────────────────────────────────────────────────────────
router.get('/audit-log', adm.getAuditLog);

// ── Admin users (super_admin only) ────────────────────────────────────────────
router.get('/users', requireSuperAdmin, adm.listAdminUsers);
router.post('/users', requireSuperAdmin, adm.createAdminUser);
router.delete('/users/:id', requireSuperAdmin, adm.deleteAdminUser);

export default router;
