import { Router } from 'express';
import { handlePaypalIPN } from '../controllers/webhookController.js';

const router = Router();

// PayPal IPN — must be public (no auth)
// PayPal sends application/x-www-form-urlencoded; express.urlencoded is already
// applied globally in server.js so no extra parser needed here.
router.post('/paypal-ipn', handlePaypalIPN);

export default router;
