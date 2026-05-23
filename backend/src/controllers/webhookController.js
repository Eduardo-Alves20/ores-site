import https from 'https';
import querystring from 'querystring';
import { query, queryOne } from '../database/connection.js';

const PAYPAL_HOSTED_BUTTON_ID = 'WPZWP2RXDTYDC';

// Verify IPN with PayPal sandbox or live
function verifyWithPayPal(rawBody) {
  return new Promise((resolve, reject) => {
    const verifyBody = 'cmd=_notify-validate&' + rawBody;
    const options = {
      hostname: 'www.paypal.com',
      port: 443,
      path: '/cgi-bin/webscr',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(verifyBody),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('PayPal IPN verify timeout')); });
    req.write(verifyBody);
    req.end();
  });
}

export async function handlePaypalIPN(req, res) {
  // Respond immediately to PayPal
  res.status(200).send('OK');

  try {
    const rawBody = querystring.stringify(req.body);
    const params = req.body;

    // 1. Verify with PayPal
    const verification = await verifyWithPayPal(rawBody);
    if (verification !== 'VERIFIED') {
      // Log only non-PII fields to avoid leaking personal data in logs
      console.warn('[PayPal IPN] Not verified:', verification, {
        txn_type: params.txn_type,
        payment_status: params.payment_status,
        txn_id: params.txn_id,
      });
      return;
    }

    const txnId     = params.txn_id || params.ipn_track_id;
    const txnType   = params.txn_type || '';
    const payStatus = (params.payment_status || '').toLowerCase();
    const mcGross   = parseFloat(params.mc_gross || 0);
    const currency  = params.mc_currency || 'BRL';
    const payerEmail = params.payer_email || '';
    const payerName  = [params.first_name, params.last_name].filter(Boolean).join(' ') || params.payer_business_name || '';
    const itemName   = params.item_name || 'Doação ORES';
    const paymentDate = params.payment_date ? new Date(params.payment_date) : new Date();

    // Only process valid donation payments
    if (!txnId) return;
    if (txnType && !['web_accept','donate',''].includes(txnType)) return;
    // Reject non-positive amounts (refunds handled via status, not negative gross)
    if (mcGross <= 0) return;

    // Map PayPal status → our status
    const statusMap = { completed: 'completed', pending: 'pending', refunded: 'refunded', reversed: 'refunded', failed: 'failed' };
    const status = statusMap[payStatus] || 'pending';

    // Upsert donation
    const existing = await queryOne('SELECT id, status FROM donations WHERE txn_id = ?', [txnId]);
    if (existing) {
      await query('UPDATE donations SET status = ?, raw_data = ? WHERE txn_id = ?', [status, JSON.stringify(params), txnId]);
      console.log(`[PayPal IPN] Updated txn ${txnId} → ${status}`);
    } else {
      await query(
        `INSERT INTO donations (txn_id, payer_email, payer_name, amount, currency, status, payment_date, item_name, raw_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [txnId, payerEmail, payerName, mcGross, currency, status, paymentDate, itemName, JSON.stringify(params)]
      );
      console.log(`[PayPal IPN] Recorded donation ${txnId} — ${currency} ${mcGross} — ${payerEmail} — ${status}`);
    }
  } catch (err) {
    console.error('[PayPal IPN] Error processing:', err.message);
  }
}
