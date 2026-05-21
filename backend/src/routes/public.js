import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { contactRateLimit } from '../middleware/security.js';
import * as pub from '../controllers/publicController.js';

const router = Router();

router.get('/home', pub.getHomeData);
router.get('/site-info', pub.getSiteInfo);
router.get('/hero-slides', pub.getHeroSlides);
router.get('/events', pub.getEvents);
router.get('/news', pub.getNews);
router.get('/news/:slug', pub.getNewsItem);
router.get('/projetos', pub.getProjetos);
router.get('/projeto-slides', pub.getProjetoSlides);
router.get('/regionais', pub.getRegionais);
router.get('/facilities', pub.getFacilities);
router.get('/social', pub.getSocialServices);
router.get('/courses', pub.getCourses);

router.post('/contact', contactRateLimit, [
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Nome inválido.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Mensagem muito curta ou longa.'),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('subject').optional().trim().isLength({ max: 200 }),
  validateRequest,
], pub.submitContact);

export default router;
