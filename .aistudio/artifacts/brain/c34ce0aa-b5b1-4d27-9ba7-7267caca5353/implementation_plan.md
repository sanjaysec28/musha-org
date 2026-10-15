# Implementation Plan: Razorpay Payment Integration

Securely integrate Razorpay (Test Mode) into the Musha Empire Unisex Salon customer booking flow and admin portal under strict Firebase Spark (free tier) constraints, maintaining existing Firestore rules, zero credential leakage, and authentic cryptographic signature verification.

---

## 1. Architectural Baseline & Constraint Analysis

### Current Deployment & Routing
* **Runtime & Build:** Currently configured as a client-side Vite Single Page Application (`vite --port=3000 --host=0.0.0.0`).
* **Firebase Environment:** Hosted on Firebase Spark project `musha-ae73e`. Firebase Cloud Functions v2 in `functions/` cannot be deployed without upgrading to the paid Blaze plan.
* **Architecture Decision (Confirmed):** Implement an **Integrated Express full-stack server (`server.ts`)** in this project using the existing `express` and `tsx` dependencies, running on port 3000 with Vite middleware mounted in development. This satisfies the requirement for a trusted backend without requiring external Cloudflare Worker infrastructure or exposing credentials.

---

## 2. Secure Backend API Architecture (`server.ts`)

Create `server.ts` as the application entry point to handle server-side API proxying and Razorpay cryptographic operations.

### Endpoints
1. `GET /api/razorpay/config`
   * **Purpose:** Exposes public client configuration.
   * **Payload Returned:** `{ keyId: process.env.RAZORPAY_KEY_ID || '', isConfigured: boolean }`
   * **Security:** `RAZORPAY_KEY_SECRET` is never exposed or returned.

2. `POST /api/razorpay/create-order`
   * **Purpose:** Creates an authoritative Razorpay Order ID.
   * **Request Body:**
     ```json
     {
       "requestId": "REQ-...",
       "serviceId": "...",
       "customerId": "...",
       "promoCode": "ROYAL15",
       "amount": 1800
     }
     ```
   * **Server-side Validation:**
     * Validates that `serviceId` exists in the canonical service catalog (`EXTENDED_SERVICES_DATA`).
     * Recomputes expected price and discounts on the server to prevent customer-side price tampering.
     * Calls Razorpay Orders API (`POST https://api.razorpay.com/v1/orders`) using Basic Authentication (`RAZORPAY_KEY_ID : RAZORPAY_KEY_SECRET`).
   * **Response:**
     ```json
     {
       "orderId": "order_...",
       "amount": 180000,
       "currency": "INR",
       "keyId": "rzp_test_..."
     }
     ```

3. `POST /api/razorpay/verify-payment`
   * **Purpose:** Cryptographically verifies payment completion via HMAC-SHA256 signature.
   * **Request Body:**
     ```json
     {
       "requestId": "REQ-...",
       "orderId": "order_...",
       "paymentId": "pay_...",
       "signature": "...",
       "customerId": "..."
     }
     ```
   * **Cryptographic Verification:**
     * Generates expected signature: `crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex')`.
     * Validates against provided `signature` using `crypto.timingSafeEqual` to avoid timing attacks.
   * **Response:**
     ```json
     {
       "success": true,
       "paymentId": "pay_...",
       "orderId": "order_...",
       "status": "paid",
       "verifiedAt": "2026-10-15T..."
     }
     ```

---

## 3. Duplicate Payment & Tamper Prevention

1. **Idempotency & Order Association:** Each Razorpay Order created is permanently tied to the unique reservation `requestId` and `customerId`.
2. **Double-Spend Guard:** Once an order or request has been verified and recorded with a `paymentId`, subsequent verification attempts for the same transaction validate against the stored transaction record without re-processing.
3. **No Client-Only Success Claims:** The frontend never marks an appointment or concierge request as `'paid'` based solely on Razorpay modal callbacks. Status transition requires the cryptographic verification response from `/api/razorpay/verify-payment`.

---

## 4. Booking Flow & Payment Options Integration

### Step 6: Confirmation Screen (`src/components/booking/BookingFlow.tsx`)
* **Payment Selector:** Present two discrete payment choices adhering to luxury aesthetic rules:
  1. **Pay Online via Razorpay (Instant VIP Confirmation)**: Credit/Debit Cards, UPI, Net Banking, and Wallets (Test Mode).
  2. **Pay at Salon Desk (Arrival Settlement)**: Traditional concierge booking with payment upon salon attendance.
* **Script Loading:** Asynchronously load `https://checkout.razorpay.com/v1/checkout.js` with non-blocking lifecycle management.
* **Modal Handling:**
  * **On Payment Success:** Collects `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`, dispatches to `/api/razorpay/verify-payment`, and upon verification persists the reservation with `payment_status: 'paid'`, `payment_gateway: 'razorpay'`, and `payment_id`.
  * **On Modal Dismissal / Cancellation (User Choice A3):** Persists the reservation request with `payment_status: 'pending'` and notes "Online payment dismissed; balance due at salon desk", smoothly transitioning to Step 7 without failing the booking.

---

## 5. Persistence & Portal Display

### Storage Architecture Under Firebase Spark
* Operates within existing Firestore security rules:
  * Records are persisted through `conciergeRequestsRepository.create()` to `/concierge_requests/{requestId}` and patron profile `/users/{userId}`.
  * Fields recorded:
    * `payment_status`: `'paid'` | `'pending'`
    * `payment_gateway`: `'razorpay'` | `'pay_at_salon'`
    * `razorpay_order_id`: string (omitted if desk payment)
    * `razorpay_payment_id`: string (omitted if desk payment)
    * `paid_amount`: number in ₹
    * `paid_at`: ISO timestamp

### Customer Portal (`DashboardAppointments.tsx`)
* In the **Requests** tab and appointment cards:
  * For online paid requests: Displays gold luxury badge `Verified Online (Razorpay)`, reference ID `pay_...`, and timestamp.
  * For desk payment: Displays `Pending Desk Settlement`.

### Staff / Admin Portal (`DashboardAppointments.tsx` & Staff Views)
* Staff see verified payment status, Razorpay Payment Reference ID, and transaction amount for easy cross-referencing with the Razorpay Dashboard.

---

## 6. Required Configuration Steps

1. **Environment Variables (`.env.example` & `.env`):**
   * `RAZORPAY_KEY_ID`: `rzp_test_...` (public)
   * `RAZORPAY_KEY_SECRET`: `...` (server-side only, never prefixed with `VITE_`)
2. **Package Configuration (`package.json`):**
   * Update `"dev"` script to `"tsx server.ts"` for full-stack Express + Vite execution.
   * Add `"start"` script `"node dist/server.js"` or `"tsx server.ts"`.

---

## 7. Verification & Testing Checklist

- [ ] **Catalog Verification:** Test order creation re-verifies price against catalog and rejects altered amounts.
- [ ] **Cryptographic Verification:** Vitest tests verifying valid HMAC signatures pass and tampered signatures return 400 Bad Request.
- [ ] **Modal Dismissal Handling:** Verify closing the modal without payment preserves the reservation as pending desk settlement.
- [ ] **Credential Security Audit:** Verify grep for `RAZORPAY_KEY_SECRET` reveals zero appearances in `src/`, client bundles, or Firestore payloads.
- [ ] **Portal Synchronization:** Verify verified payment status and `pay_...` ID render accurately in both customer and staff dashboard tabs.
- [ ] **Build & Lint:** Verify `tsc --noEmit` and `npm run build` compile cleanly without regression.
