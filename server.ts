/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Salon — Full-Stack Server
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// JSON parser
app.use(express.json());

// ----------------------------------------------------------------------------
// RAZORPAY API ROUTES
// ----------------------------------------------------------------------------

/**
 * GET /api/razorpay/config
 * Returns public configuration for client Razorpay checkout initialization.
 * NEVER returns RAZORPAY_KEY_SECRET.
 */
app.get('/api/razorpay/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const isConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET);
  res.json({
    keyId,
    isConfigured,
    currency: 'INR'
  });
});

/**
 * POST /api/razorpay/create-order
 * Authoritatively creates a Razorpay order via Razorpay REST API.
 */
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    const { requestId, serviceId, amount, customerId, customerName } = req.body || {};

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'INVALID_AMOUNT' });
    }

    if (!requestId) {
      return res.status(400).json({ success: false, error: 'MISSING_REQUEST_ID' });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // If Razorpay API credentials are not set in environment,
    // return clear message so frontend can guide or fallback to Pay at Salon Desk
    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        error: 'RAZORPAY_NOT_CONFIGURED',
        message: 'Razorpay Key ID or Key Secret is not configured in server environment.'
      });
    }

    // Call official Razorpay Orders API
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const orderPayload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(requestId).slice(0, 40),
      notes: {
        requestId: String(requestId),
        serviceId: String(serviceId || ''),
        customerId: String(customerId || ''),
        customerName: String(customerName || '')
      }
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Razorpay Orders API error:', response.status, errBody);
      return res.status(response.status).json({
        success: false,
        error: 'RAZORPAY_ORDER_FAILED',
        details: errBody
      });
    }

    const orderData = await response.json();
    return res.json({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId
    });
  } catch (err: any) {
    console.error('Unexpected error in create-order:', err);
    return res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR', message: err?.message });
  }
});

/**
 * POST /api/razorpay/verify-payment
 * Cryptographically verifies Razorpay payment signature via HMAC-SHA256.
 */
app.post('/api/razorpay/verify-payment', (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keySecret) {
      return res.status(503).json({
        success: false,
        error: 'RAZORPAY_NOT_CONFIGURED',
        message: 'Razorpay Key Secret is not configured in server environment.'
      });
    }

    const { orderId, paymentId, signature, requestId } = req.body || {};

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PAYMENT_TOKENS',
        message: 'orderId, paymentId, and signature are required.'
      });
    }

    // Expected signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
    const bodyToSign = `${orderId}|${paymentId}`;
    const expectedSignature = crypto.createHmac('sha256', keySecret)
      .update(bodyToSign)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      console.warn('Razorpay signature mismatch for order:', orderId, paymentId);
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'INVALID_SIGNATURE',
        message: 'Payment verification failed: Signature mismatch.'
      });
    }

    // Signature verified successfully
    return res.json({
      success: true,
      verified: true,
      paymentId,
      orderId,
      requestId,
      status: 'paid',
      verifiedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({ success: false, error: 'VERIFICATION_ERROR', message: err?.message });
  }
});

// ----------------------------------------------------------------------------
// VITE SPA DEV MIDDLEWARE / STATIC PRODUCTION SERVING
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Musha Empire full-stack server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
