import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { contactRateLimit } from '../middleware/security.js';
import * as pub from '../controllers/publicController.js';

const router = Router();

router.get('/home', pub.getHomeData);
router.get('/site-info', pub.getSiteInfo);
router.get('/hero-slides', pub.getHeroSlides);
router.get('/word-of-day', pub.getWordOfDay);
router.get('/mass-schedule', pub.getMassSchedule);
router.get('/events', pub.getEvents);
router.get('/priests', pub.getPriests);
router.get('/news', pub.getNews);
router.get('/news/:slug', pub.getNewsItem);
router.get('/prayer-groups', pub.getPrayerGroups);
router.get('/prayer-group-slides', pub.getPrayerGroupSlides);
router.get('/pastorals', pub.getPastorals);
router.get('/pastoral-slides', pub.getPastoralSlides);
router.get('/communities', pub.getCommunities);
router.get('/facilities', pub.getFacilities);
router.get('/room-bookings', pub.getRoomBookings);
router.get('/social', pub.getSocialServices);
router.get('/homilies', pub.getHomilies);

router.post('/room-bookings', [
  body('facility_id').isInt({ min: 1 }),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('booking_date').isDate(),
  body('start_time').matches(/^\d{2}:\d{2}$/),
  body('end_time').matches(/^\d{2}:\d{2}$/),
  body('requester_name').trim().isLength({ min: 2, max: 150 }),
  validateRequest,
], pub.createRoomBooking);

router.post('/contact', contactRateLimit, [
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Nome inválido.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Mensagem muito curta ou longa.'),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('subject').optional().trim().isLength({ max: 200 }),
  validateRequest,
], pub.submitContact);

export default router;
