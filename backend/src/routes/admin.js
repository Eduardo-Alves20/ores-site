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
router.post('/word-of-day/refresh', adm.refreshWordOfDay);

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
  body('slug').trim().isSlug().withMessage('Slug inválido (use apenas letras, números e hífens).'),
  validateRequest,
], adm.createNews);
router.put('/news/:id', adm.updateNews);
router.delete('/news/:id', adm.deleteNews);

// ── Priests ──────────────────────────────────────────────────────────────────
router.get('/priests', adm.listPriests);
router.post('/priests', [
  body('name').trim().isLength({ min: 3 }),
  body('sigla').trim().isLength({ min: 1, max: 10 }),
  body('role').trim().isLength({ min: 3 }),
  validateRequest,
], adm.createPriest);
router.put('/priests/:id', adm.updatePriest);
router.delete('/priests/:id', adm.deletePriest);

// ── Mass schedule ────────────────────────────────────────────────────────────
router.get('/mass-schedule', adm.listMassSchedule);
router.put('/mass-schedule/:id', adm.updateMassDay);

// ── Prayer groups ─────────────────────────────────────────────────────────────
router.get('/groups', adm.listGroups);
router.post('/groups', adm.createGroup);
router.put('/groups/:id', adm.updateGroup);
router.delete('/groups/:id', adm.deleteGroup);
router.get('/group-slides', adm.listGroupSlides);
router.post('/group-slides', adm.createGroupSlide);
router.put('/group-slides/:id', adm.updateGroupSlide);
router.delete('/group-slides/:id', adm.deleteGroupSlide);

// ── Pastorals ────────────────────────────────────────────────────────────────
router.get('/pastorals', adm.listPastorals);
router.post('/pastorals', adm.createPastoral);
router.put('/pastorals/:id', adm.updatePastoral);
router.delete('/pastorals/:id', adm.deletePastoral);
router.get('/pastoral-slides', adm.listPastoralSlides);
router.post('/pastoral-slides', adm.createPastoralSlide);
router.put('/pastoral-slides/:id', adm.updatePastoralSlide);
router.delete('/pastoral-slides/:id', adm.deletePastoralSlide);

// ── Communities ──────────────────────────────────────────────────────────────
router.get('/communities', adm.listCommunities);
router.post('/communities', adm.createCommunity);
router.put('/communities/:id', adm.updateCommunity);
router.delete('/communities/:id', adm.deleteCommunity);

// ── Facilities ───────────────────────────────────────────────────────────────
router.get('/facilities', adm.listFacilities);
router.put('/facilities/:id', adm.updateFacility);

// ── Room bookings ─────────────────────────────────────────────────────────────
router.get('/bookings', adm.listBookings);
router.put('/bookings/:id', adm.updateBookingStatus);

// ── Homilies ─────────────────────────────────────────────────────────────────
router.post('/homilies/media', adm.uploadHomilyMedia);
router.get('/homilies', adm.listHomilies);
router.post('/homilies', adm.createHomily);
router.put('/homilies/:id', adm.updateHomily);
router.delete('/homilies/:id', adm.deleteHomily);

// ── Courses ──────────────────────────────────────────────────────────────────
router.get('/courses', adm.listCourses);
router.post('/courses', adm.createCourse);
router.put('/courses/:id', adm.updateCourse);
router.delete('/courses/:id', adm.deleteCourse);

// ── Social services ───────────────────────────────────────────────────────────
router.get('/services', adm.listServices);
router.put('/services/:id', adm.updateService);

// ── Messages ──────────────────────────────────────────────────────────────────
router.get('/messages', adm.listMessages);
router.put('/messages/:id/read', adm.markMessageRead);
router.delete('/messages/:id', adm.deleteMessage);

// ── Audit log ────────────────────────────────────────────────────────────────
router.get('/audit-log', adm.getAuditLog);

// ── Admin users (super_admin only) ────────────────────────────────────────────
router.get('/users', requireSuperAdmin, adm.listAdminUsers);
router.post('/users', requireSuperAdmin, adm.createAdminUser);
router.delete('/users/:id', requireSuperAdmin, adm.deleteAdminUser);

export default router;
