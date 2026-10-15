/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Salon — Razorpay Client Integration
 */

export interface RazorpayConfigResponse {
  keyId: string;
  isConfigured: boolean;
  currency: string;
}

export interface CreateOrderParams {
  requestId: string;
  serviceId: string;
  amount: number;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
  message?: string;
}

export interface VerifyPaymentParams {
  requestId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  customerId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified?: boolean;
  paymentId?: string;
  orderId?: string;
  status?: string;
  error?: string;
  message?: string;
}

/**
 * Dynamically loads the Razorpay checkout.js script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Retrieves public Razorpay configuration from server.
 * Never requests or exposes the Key Secret.
 */
export async function getRazorpayConfig(): Promise<RazorpayConfigResponse> {
  try {
    const res = await fetch('/api/razorpay/config');
    if (!res.ok) {
      return { keyId: '', isConfigured: false, currency: 'INR' };
    }
    return await res.json();
  } catch (err) {
    console.warn('Notice fetching Razorpay public config from backend:', err);
    return { keyId: '', isConfigured: false, currency: 'INR' };
  }
}

/**
 * Calls backend to create an authoritative Razorpay order.
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Network error creating Razorpay order:', err);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: err?.message || 'Failed to connect to payment server.'
    };
  }
}

/**
 * Dispatches payment tokens to backend for cryptographic HMAC-SHA256 signature verification.
 */
export async function verifyRazorpayPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
  try {
    const res = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Network error verifying Razorpay payment:', err);
    return {
      success: false,
      verified: false,
      error: 'VERIFICATION_NETWORK_ERROR',
      message: err?.message || 'Failed to verify payment with server.'
    };
  }
}
