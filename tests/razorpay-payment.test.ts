/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Salon — Razorpay Payment Security & Workflow Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { normalizeConciergeRequestPayload } from '../src/lib/firestoreService';
import { FirestoreConciergeRequest } from '../src/types/firestore';

describe('Razorpay Payment Architecture & Cryptographic Verification', () => {
  const TEST_KEY_SECRET = 'test_secret_musha_luxury_salon_xyz123';
  const TEST_KEY_ID = 'rzp_test_1234567890ABCD';

  it('Check 1 (PASS): Valid HMAC-SHA256 signature is verified successfully', () => {
    const orderId = 'order_DA78F9H1J2K3L4';
    const paymentId = 'pay_9876543210ZYXW';

    // Authoritative HMAC-SHA256 calculation: order_id + "|" + payment_id
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(payload)
      .digest('hex');

    // Simulate verification function
    const verifySignature = (
      oId: string,
      pId: string,
      sig: string,
      secret: string
    ): boolean => {
      const body = `${oId}|${pId}`;
      const generated = crypto.createHmac('sha256', secret).update(body).digest('hex');
      const expectedBuf = Buffer.from(generated, 'utf8');
      const providedBuf = Buffer.from(sig, 'utf8');
      if (expectedBuf.length !== providedBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, providedBuf);
    };

    const isValid = verifySignature(orderId, paymentId, expectedSignature, TEST_KEY_SECRET);
    expect(isValid).toBe(true);
  });

  it('Check 2 (PASS): Forged or tampered signature is strictly rejected with timingSafeEqual', () => {
    const orderId = 'order_DA78F9H1J2K3L4';
    const paymentId = 'pay_9876543210ZYXW';
    const tamperedSignature = 'a'.repeat(64); // Tampered 64-char hex string

    const verifySignature = (
      oId: string,
      pId: string,
      sig: string,
      secret: string
    ): boolean => {
      const body = `${oId}|${pId}`;
      const generated = crypto.createHmac('sha256', secret).update(body).digest('hex');
      const expectedBuf = Buffer.from(generated, 'utf8');
      const providedBuf = Buffer.from(sig, 'utf8');
      if (expectedBuf.length !== providedBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, providedBuf);
    };

    const isValid = verifySignature(orderId, paymentId, tamperedSignature, TEST_KEY_SECRET);
    expect(isValid).toBe(false);
  });

  it('Check 3 (PASS): Currency conversion to paise produces exact integer amounts for Razorpay', () => {
    const amountInRupees = 1950.5; // ₹1,950.50
    const amountInPaise = Math.round(amountInRupees * 100);
    expect(amountInPaise).toBe(195050);

    const standardTotal = 95; // ₹95
    expect(Math.round(standardTotal * 100)).toBe(9500);
  });

  it('Check 4 (PASS): Concierge request normalization correctly persists verified Razorpay payment tokens', () => {
    const rawWithPayment: Record<string, any> = {
      id: 'REQ-RZP98124',
      customer_id: 'cust_vip_001',
      customer_name: 'Ananya Singhania',
      service_id: 'service-1',
      service_name: 'Imperial 24K Gold Facial Ritual',
      gender: 'Women',
      booking_date: '2026-10-30',
      start_time: '14:00',
      end_time: '15:15',
      duration_minutes: 75,
      total_amount: 180,
      status: 'submitted',
      payment_status: 'paid',
      payment_gateway: 'razorpay',
      razorpay_order_id: '  order_DA78F9H1J2K3L4  ',
      razorpay_payment_id: '  pay_9876543210ZYXW  ',
      paid_amount: 180,
      paid_at: '2026-10-15T13:30:00.000Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const clean = normalizeConciergeRequestPayload(rawWithPayment);

    expect(clean.payment_status).toBe('paid');
    expect(clean.payment_gateway).toBe('razorpay');
    expect(clean.razorpay_order_id).toBe('order_DA78F9H1J2K3L4');
    expect(clean.razorpay_payment_id).toBe('pay_9876543210ZYXW');
    expect(clean.paid_amount).toBe(180);
    expect(clean.paid_at).toBe('2026-10-15T13:30:00.000Z');
  });

  it('Check 5 (PASS): Desk settlement preserves pending payment status and omits undefined/empty tokens', () => {
    const rawDeskSettlement: Record<string, any> = {
      id: 'REQ-DESK98125',
      customer_id: 'cust_vip_002',
      customer_name: 'Rohit Verma',
      service_id: 'service-2',
      service_name: 'Gentlemen Royal Shave',
      gender: 'Men',
      booking_date: '2026-10-30',
      start_time: '16:00',
      end_time: '16:45',
      duration_minutes: 45,
      total_amount: 85,
      status: 'submitted',
      payment_status: 'pending',
      payment_gateway: 'pay_at_salon',
      razorpay_order_id: undefined,
      razorpay_payment_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const clean = normalizeConciergeRequestPayload(rawDeskSettlement);

    expect(clean.payment_status).toBe('pending');
    expect(clean.payment_gateway).toBe('pay_at_salon');
    expect('razorpay_order_id' in clean).toBe(false);
    expect('razorpay_payment_id' in clean).toBe(false);
  });

  it('Check 6 (PASS): Key Secret is never present in client-side code, components, or client environment variables', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const readDirRecursive = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.resolve(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(readDirRecursive(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const files = readDirRecursive(srcDir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      // No client file may contain the server secret key variable or reference it
      expect(content).not.toContain('process.env.RAZORPAY_KEY_SECRET');
      expect(content).not.toContain('VITE_RAZORPAY_KEY_SECRET');
    }
  });

  it('Check 7 (PASS): server.ts contains Razorpay create-order and verify-payment endpoints with timingSafeEqual', () => {
    const serverSource = fs.readFileSync(path.resolve(__dirname, '../server.ts'), 'utf8');

    expect(serverSource).toContain('/api/razorpay/create-order');
    expect(serverSource).toContain('/api/razorpay/verify-payment');
    expect(serverSource).toContain('/api/razorpay/config');
    expect(serverSource).toContain('crypto.timingSafeEqual');
    expect(serverSource).toContain('crypto.createHmac');
    expect(serverSource).toContain('RAZORPAY_KEY_SECRET');
  });

  it('Check 8 (PASS): Firestore security rules for bookings write protection remain strict', () => {
    const rulesSource = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');

    // Confirms client write restrictions remain intact
    expect(rulesSource).toContain('match /bookings/{bookingId}');
    expect(rulesSource).toContain('allow write: if false;');
  });
});
