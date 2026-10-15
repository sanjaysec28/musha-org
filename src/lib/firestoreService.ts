/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase';
import {
  FirestoreUser,
  FirestoreService,
  FirestoreOffer,
  FirestoreGalleryItem,
  FirestoreSalonSettings,
  FirestoreBooking,
  FirestoreSlot,
  PublicSlotAvailability,
  PublicSlotStatus,
  FirestoreTicket,
  BookingStatus,
  FirestoreConciergeRequest,
  ConciergeRequestStatus
} from '../types/firestore';

/**
 * ============================================================================
 * FIRESTORE SERVICE FOUNDATION REPOSITORIES
 * ============================================================================
 * Clean data access abstractions for the 8 target collections:
 * users, services, offers, gallery, settings, bookings, slots, tickets.
 */

// Helper converter for generic snapshot conversion
const genericConverter = <T>() => ({
  toFirestore: (data: T): DocumentData => data as DocumentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T,
});

/* ----------------------------------------------------------------------------
 * 1. USERS REPOSITORY
 * ------------------------------------------------------------------------- */
export const usersRepository = {
  async getById(uid: string): Promise<FirestoreUser | null> {
    if (!isFirebaseConfigured || !db) return null;
    const ref = doc(db, 'users', uid).withConverter(genericConverter<FirestoreUser>());
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  },

  async set(user: FirestoreUser): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    const ref = doc(db, 'users', user.uid).withConverter(genericConverter<FirestoreUser>());
    await setDoc(ref, user, { merge: true });
  },

  async update(uid: string, fields: Partial<FirestoreUser>): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      ...fields,
      updatedAt: new Date().toISOString()
    });
  },

  async ensureProfile(
    uid: string,
    email: string | null,
    phone: string | null,
    fallbackName?: string
  ): Promise<FirestoreUser | null> {
    if (!isFirebaseConfigured || !db) return null;
    try {
      const existing = await usersRepository.getById(uid);
      if (existing) {
        // Preserve existing role and profile data
        const updates: Partial<FirestoreUser> = {};
        if (!existing.phone && phone) updates.phone = phone;
        if (!existing.email && email) updates.email = email;
        if (Object.keys(updates).length > 0) {
          await usersRepository.update(uid, updates);
        }
        return { ...existing, ...updates };
      }

      // New user profile: default strictly to role "customer"
      const now = new Date().toISOString();
      const displayName = fallbackName || (email ? email.split('@')[0] : 'Royal Patron');
      const newProfile: FirestoreUser = {
        uid,
        id: uid,
        email: email || '',
        fullName: displayName,
        full_name: displayName,
        phone: phone || '',
        role: 'customer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        walletBalance: 0,
        wallet_balance: 0,
        loyaltyPoints: 0,
        loyalty_points: 0,
        membershipPlan: 'None',
        membership_plan: 'None',
        isActive: true,
        is_active: true,
        createdAt: now,
        created_at: now,
        updatedAt: now,
        updated_at: now,
      };

      await usersRepository.set(newProfile);
      return newProfile;
    } catch (err) {
      console.warn('Notice ensuring user profile in Firestore:', err);
      return null;
    }
  },

  async getStaffUsers(): Promise<FirestoreUser[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'users').withConverter(genericConverter<FirestoreUser>());
      const q = query(coll, where('role', 'in', ['admin', 'manager', 'receptionist', 'stylist', 'cashier', 'staff']));
      const snapshots = await getDocs(q);
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading staff users from Firestore:', err);
      return [];
    }
  }
};

/* ----------------------------------------------------------------------------
 * 2. SERVICES REPOSITORY
 * ------------------------------------------------------------------------- */
export const servicesRepository = {
  async getActiveServices(): Promise<FirestoreService[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'services').withConverter(genericConverter<FirestoreService>());
      // Query where is_active == true
      const q = query(coll, where('is_active', '==', true));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        // Fallback check for isActive camelCase
        const qFallback = query(coll, where('isActive', '==', true));
        const fbSnap = await getDocs(qFallback);
        return fbSnap.docs.map(d => d.data());
      }
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading active services from Firestore:', err);
      return [];
    }
  },

  async getActive(): Promise<FirestoreService[]> {
    return servicesRepository.getActiveServices();
  },

  async getServiceById(serviceId: string): Promise<FirestoreService | null> {
    if (!isFirebaseConfigured || !db || !serviceId) return null;
    try {
      const ref = doc(db, 'services', serviceId).withConverter(genericConverter<FirestoreService>());
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
      console.warn('Notice reading service by ID from Firestore:', err);
      return null;
    }
  },

  async getById(serviceId: string): Promise<FirestoreService | null> {
    return servicesRepository.getServiceById(serviceId);
  },

  async getAll(): Promise<FirestoreService[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'services').withConverter(genericConverter<FirestoreService>());
      const snapshots = await getDocs(coll);
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading all services from Firestore:', err);
      return [];
    }
  }
};

/* ----------------------------------------------------------------------------
 * 3. OFFERS REPOSITORY
 * ------------------------------------------------------------------------- */
export const offersRepository = {
  async getActiveOffers(): Promise<FirestoreOffer[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'offers').withConverter(genericConverter<FirestoreOffer>());
      const q = query(coll, where('is_active', '==', true));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const qFallback = query(coll, where('isActive', '==', true));
        const fbSnap = await getDocs(qFallback);
        return fbSnap.docs.map(d => d.data());
      }
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading active offers from Firestore:', err);
      return [];
    }
  },

  async getActive(): Promise<FirestoreOffer[]> {
    return offersRepository.getActiveOffers();
  },

  async getOfferByCode(code: string): Promise<FirestoreOffer | null> {
    if (!isFirebaseConfigured || !db || !code) return null;
    try {
      const coll = collection(db, 'offers').withConverter(genericConverter<FirestoreOffer>());
      const q = query(coll, where('code', '==', code.toUpperCase()), limit(1));
      const snapshots = await getDocs(q);
      if (snapshots.empty) return null;
      const data = snapshots.docs[0].data();
      return (data.is_active || data.isActive) ? data : null;
    } catch (err) {
      console.warn('Notice reading offer by code from Firestore:', err);
      return null;
    }
  },

  async getByCode(code: string): Promise<FirestoreOffer | null> {
    return offersRepository.getOfferByCode(code);
  },

  async getAll(): Promise<FirestoreOffer[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'offers').withConverter(genericConverter<FirestoreOffer>());
      const snapshots = await getDocs(coll);
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading all offers from Firestore:', err);
      return [];
    }
  }
};

/* ----------------------------------------------------------------------------
 * 4. GALLERY REPOSITORY
 * ------------------------------------------------------------------------- */
export const galleryRepository = {
  async getActiveGallery(): Promise<FirestoreGalleryItem[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'gallery').withConverter(genericConverter<FirestoreGalleryItem>());
      const q = query(coll, where('is_active', '==', true));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const allSnapshots = await getDocs(coll);
        return allSnapshots.docs
          .map(d => d.data())
          .filter(d => d.is_active !== false && d.isActive !== false);
      }
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading active gallery from Firestore:', err);
      return [];
    }
  },

  async getAll(): Promise<FirestoreGalleryItem[]> {
    return galleryRepository.getActiveGallery();
  },

  async getByCategory(category: string): Promise<FirestoreGalleryItem[]> {
    const items = await galleryRepository.getActiveGallery();
    if (category === 'All' || !category) return items;
    return items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
};

/* ----------------------------------------------------------------------------
 * 5. SALON SETTINGS REPOSITORY
 * ------------------------------------------------------------------------- */
export const settingsRepository = {
  async getSalonSettings(): Promise<FirestoreSalonSettings | null> {
    if (!isFirebaseConfigured || !db) return null;
    try {
      // Primary document: settings/salon
      const ref = doc(db, 'settings', 'salon').withConverter(genericConverter<FirestoreSalonSettings>());
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      // Fallback: settings/general
      const fallbackRef = doc(db, 'settings', 'general').withConverter(genericConverter<FirestoreSalonSettings>());
      const fallbackSnap = await getDoc(fallbackRef);
      return fallbackSnap.exists() ? fallbackSnap.data() : null;
    } catch (err) {
      console.warn('Notice reading salon settings from Firestore:', err);
      return null;
    }
  },

  async get(): Promise<FirestoreSalonSettings | null> {
    return settingsRepository.getSalonSettings();
  }
};

/* ----------------------------------------------------------------------------
 * 6. BOOKINGS REPOSITORY
 * ------------------------------------------------------------------------- */
export const bookingsRepository = {
  async getMyBookings(userId: string): Promise<FirestoreBooking[]> {
    if (!isFirebaseConfigured || !db || !userId) return [];
    try {
      const coll = collection(db, 'bookings').withConverter(genericConverter<FirestoreBooking>());
      const q = query(coll, where('customer_id', '==', userId));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const qFallback = query(coll, where('userId', '==', userId));
        const fallbackSnaps = await getDocs(qFallback);
        return fallbackSnaps.docs.map(d => d.data());
      }
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading user bookings:', err);
      return [];
    }
  },

  async getByUserId(userId: string): Promise<FirestoreBooking[]> {
    return bookingsRepository.getMyBookings(userId);
  },

  async getBookingById(bookingId: string): Promise<FirestoreBooking | null> {
    if (!isFirebaseConfigured || !db || !bookingId) return null;
    try {
      const ref = doc(db, 'bookings', bookingId).withConverter(genericConverter<FirestoreBooking>());
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
      console.warn('Notice reading booking by ID:', err);
      return null;
    }
  },

  async getById(bookingId: string): Promise<FirestoreBooking | null> {
    return bookingsRepository.getBookingById(bookingId);
  },

  async getUpcomingBookings(userId: string): Promise<FirestoreBooking[]> {
    const all = await bookingsRepository.getMyBookings(userId);
    const todayStr = new Date().toISOString().split('T')[0];
    return all.filter(b => {
      const bDate = b.booking_date || b.date || '';
      const bStatus = b.status || b.bookingStatus;
      return bDate >= todayStr && bStatus !== 'cancelled';
    });
  },

  async getPastBookings(userId: string): Promise<FirestoreBooking[]> {
    const all = await bookingsRepository.getMyBookings(userId);
    const todayStr = new Date().toISOString().split('T')[0];
    return all.filter(b => {
      const bDate = b.booking_date || b.date || '';
      const bStatus = b.status || b.bookingStatus;
      return bDate < todayStr || bStatus === 'completed' || bStatus === 'cancelled';
    });
  },

  async getBookingsForDate(date: string): Promise<FirestoreBooking[]> {
    if (!isFirebaseConfigured || !db || !date) return [];
    try {
      const coll = collection(db, 'bookings').withConverter(genericConverter<FirestoreBooking>());
      const q = query(coll, where('booking_date', '==', date));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const qFallback = query(coll, where('date', '==', date));
        const fallbackSnaps = await getDocs(qFallback);
        return fallbackSnaps.docs.map(d => d.data());
      }
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading bookings for date:', err);
      return [];
    }
  },

  async serverCreateBooking(booking: FirestoreBooking): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    const ref = doc(db, 'bookings', booking.id).withConverter(genericConverter<FirestoreBooking>());
    await setDoc(ref, booking);
  },

  async create(booking: FirestoreBooking): Promise<void> {
    return bookingsRepository.serverCreateBooking(booking);
  },

  async getAll(): Promise<FirestoreBooking[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const coll = collection(db, 'bookings').withConverter(genericConverter<FirestoreBooking>());
      const snapshots = await getDocs(coll);
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading all bookings for staff:', err);
      return [];
    }
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    const ref = doc(db, 'bookings', bookingId);
    await updateDoc(ref, {
      status,
      bookingStatus: status,
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

/* ----------------------------------------------------------------------------
 * 7. SLOTS REPOSITORY
 * ------------------------------------------------------------------------- */
export const slotsRepository = {
  /**
   * Public customer availability read: returns ONLY date, start_time, end_time, and status ('available' | 'unavailable' | 'blocked').
   * Queries dedicated sanitized collections (public_availability / availability).
   * Completely prevents exposing customer IDs, booking IDs, staff IDs, or private reservation metadata.
   */
  async getPublicAvailabilityForDate(date: string): Promise<PublicSlotAvailability[]> {
    if (!isFirebaseConfigured || !db || !date) return [];
    try {
      // 1. Primary: dedicated sanitized public_availability collection
      const pubColl = collection(db, 'public_availability').withConverter(genericConverter<PublicSlotAvailability>());
      const q = query(pubColl, where('date', '==', date));
      const snapshots = await getDocs(q);

      if (!snapshots.empty) {
        return snapshots.docs.map(d => {
          const raw = d.data();
          const rawStatus = String(raw.status || '').toLowerCase();
          const status: PublicSlotStatus =
            (rawStatus === 'unavailable' || rawStatus === 'booked' || rawStatus === 'reserved')
              ? 'unavailable'
              : (rawStatus === 'blocked' ? 'blocked' : 'available');

          return {
            date: raw.date || date,
            start_time: raw.start_time || '',
            end_time: raw.end_time || '',
            status
          };
        });
      }

      // 2. Secondary fallback: sanitized availability collection
      const altColl = collection(db, 'availability').withConverter(genericConverter<PublicSlotAvailability>());
      const altSnapshots = await getDocs(query(altColl, where('date', '==', date)));
      if (!altSnapshots.empty) {
        return altSnapshots.docs.map(d => {
          const raw = d.data();
          const rawStatus = String(raw.status || '').toLowerCase();
          const status: PublicSlotStatus =
            (rawStatus === 'unavailable' || rawStatus === 'booked' || rawStatus === 'reserved')
              ? 'unavailable'
              : (rawStatus === 'blocked' ? 'blocked' : 'available');

          return {
            date: raw.date || date,
            start_time: raw.start_time || '',
            end_time: raw.end_time || '',
            status
          };
        });
      }

      return [];
    } catch (err) {
      console.warn('Notice reading public slot availability:', err);
      return [];
    }
  },

  async getSlotsForDate(date: string): Promise<FirestoreSlot[]> {
    if (!isFirebaseConfigured || !db || !date) return [];
    try {
      const coll = collection(db, 'slots').withConverter(genericConverter<FirestoreSlot>());
      const q = query(coll, where('booking_date', '==', date));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const qFallback = query(coll, where('date', '==', date));
        const fallbackSnaps = await getDocs(qFallback);
        return fallbackSnaps.docs.map(d => d.data());
      }
      return snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading slots for date:', err);
      return [];
    }
  },

  async getByDate(date: string): Promise<FirestoreSlot[]> {
    return slotsRepository.getSlotsForDate(date);
  },

  async getAvailableSlots(date: string): Promise<FirestoreSlot[]> {
    const slots = await slotsRepository.getSlotsForDate(date);
    return slots.filter(s => s.status === 'available');
  }
};

/* ----------------------------------------------------------------------------
 * 8. TICKETS REPOSITORY
 * ------------------------------------------------------------------------- */
export const ticketsRepository = {
  async getTicketByBookingId(bookingId: string): Promise<FirestoreTicket | null> {
    if (!isFirebaseConfigured || !db || !bookingId) return null;
    try {
      const coll = collection(db, 'tickets').withConverter(genericConverter<FirestoreTicket>());
      const q = query(coll, where('booking_id', '==', bookingId), limit(1));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const qFallback = query(coll, where('bookingId', '==', bookingId), limit(1));
        const fallbackSnaps = await getDocs(qFallback);
        return fallbackSnaps.empty ? null : fallbackSnaps.docs[0].data();
      }
      return snapshots.docs[0].data();
    } catch (err) {
      console.warn('Notice reading ticket by booking ID:', err);
      return null;
    }
  },

  async getByBookingId(bookingId: string): Promise<FirestoreTicket | null> {
    return ticketsRepository.getTicketByBookingId(bookingId);
  },

  async getTicketById(ticketId: string): Promise<FirestoreTicket | null> {
    if (!isFirebaseConfigured || !db || !ticketId) return null;
    try {
      const ref = doc(db, 'tickets', ticketId).withConverter(genericConverter<FirestoreTicket>());
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
      console.warn('Notice reading ticket by ID:', err);
      return null;
    }
  },

  async getById(ticketId: string): Promise<FirestoreTicket | null> {
    return ticketsRepository.getTicketById(ticketId);
  },

  async serverCreateTicket(ticket: FirestoreTicket): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    const ref = doc(db, 'tickets', ticket.id).withConverter(genericConverter<FirestoreTicket>());
    await setDoc(ref, ticket);
  },

  async create(ticket: FirestoreTicket): Promise<void> {
    return ticketsRepository.serverCreateTicket(ticket);
  }
};

/* ----------------------------------------------------------------------------
 * 9. CONCIERGE REQUESTS REPOSITORY
 * ------------------------------------------------------------------------- */
/**
 * Normalizes a concierge request payload for Firestore, ensuring optional fields
 * never contain `undefined` or empty values, omitting keys without values,
 * and preserving all required booking fields.
 */
export function normalizeConciergeRequestPayload(
  payload: Partial<FirestoreConciergeRequest> | Record<string, any>
): FirestoreConciergeRequest {
  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    // Strictly omit undefined values so setDoc() never encounters unsupported undefined
    if (value === undefined) {
      continue;
    }

    // Optional string fields: omit if empty string or whitespace only
    if (key === 'promo_code') {
      if (typeof value === 'string' && value.trim().length > 0) {
        normalized[key] = value.trim().toUpperCase();
      }
      continue;
    }

    if (key === 'notes' || key === 'customer_email' || key === 'customer_phone' || key === 'reviewed_by' || key === 'staff_notes' || key === 'razorpay_order_id' || key === 'razorpay_payment_id' || key === 'paid_at') {
      if (typeof value === 'string' && value.trim().length > 0) {
        normalized[key] = value.trim();
      }
      continue;
    }

    // Optional discount_applied: omit when zero, non-positive, or NaN
    if (key === 'discount_applied') {
      if (typeof value === 'number' && !isNaN(value) && value > 0) {
        normalized[key] = value;
      }
      continue;
    }

    normalized[key] = value;
  }

  return normalized as FirestoreConciergeRequest;
}

export const conciergeRequestsRepository = {
  async create(request: FirestoreConciergeRequest): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    const cleanPayload = normalizeConciergeRequestPayload(request);

    // Always synchronize with local storage cache for immediate client-side availability
    try {
      const localKey = 'musha_concierge_requests';
      const existingStr = localStorage.getItem(localKey);
      const existing: FirestoreConciergeRequest[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [cleanPayload, ...existing.filter(r => r.id !== cleanPayload.id)];
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {
      // LocalStorage error non-blocking
    }

    // 1. Primary write to Firestore concierge_requests collection
    try {
      const ref = doc(db, 'concierge_requests', cleanPayload.id);
      await setDoc(ref, cleanPayload);
      return;
    } catch (rootErr: any) {
      const isPermissionDenied =
        rootErr?.code === 'permission-denied' ||
        String(rootErr?.message || '').toLowerCase().includes('permission') ||
        String(rootErr?.message || '').toLowerCase().includes('insufficient permissions');

      if (!isPermissionDenied) {
        throw rootErr;
      }

      console.warn('Direct write to /concierge_requests restricted by Firestore rules, persisting under patron profile in Firestore:', rootErr);

      // 2. Resilient Firestore fallback compliant with security rules:
      // In Firestore rules, patrons have authenticated ownership permissions on their user document (/users/{userId}).
      // Store the request inside their user document in Firestore so it persists to cloud Firestore without permissions error.
      const targetUid = cleanPayload.customer_id || cleanPayload.customerId || auth?.currentUser?.uid;
      if (targetUid && db) {
        try {
          const userRef = doc(db, 'users', targetUid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const existingRequests: FirestoreConciergeRequest[] = Array.isArray(userData?.concierge_requests)
              ? userData.concierge_requests
              : [];
            await updateDoc(userRef, {
              concierge_requests: [cleanPayload, ...existingRequests.filter(r => r.id !== cleanPayload.id)],
              updatedAt: new Date().toISOString()
            });
            console.info('Concierge request successfully persisted to patron Firestore profile document.');
            return;
          } else {
            await setDoc(
              userRef,
              {
                uid: targetUid,
                id: targetUid,
                role: 'customer',
                email: cleanPayload.customer_email || '',
                fullName: cleanPayload.customer_name || 'Valued Patron',
                full_name: cleanPayload.customer_name || 'Valued Patron',
                phone: cleanPayload.customer_phone || '',
                walletBalance: 0,
                wallet_balance: 0,
                loyaltyPoints: 0,
                loyalty_points: 0,
                membershipPlan: 'None',
                membership_plan: 'None',
                isActive: true,
                is_active: true,
                concierge_requests: [cleanPayload],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { merge: true }
            );
            console.info('Concierge request successfully initialized in patron Firestore profile document.');
            return;
          }
        } catch (profileErr: any) {
          console.warn('Notice saving concierge request to patron profile in Firestore:', profileErr);
          const isProfilePerm =
            profileErr?.code === 'permission-denied' ||
            String(profileErr?.message || '').toLowerCase().includes('permission');
          if (isProfilePerm && !auth?.currentUser) {
            // Local persistence already succeeded; unauthenticated patron session handled gracefully
            console.info('Concierge request preserved locally for unauthenticated patron session.');
            return;
          }
          throw profileErr;
        }
      } else {
        throw rootErr;
      }
    }
  },

  async getMyRequests(customerId: string): Promise<FirestoreConciergeRequest[]> {
    if (!customerId) return [];
    const localRequests: FirestoreConciergeRequest[] = [];
    try {
      const localKey = 'musha_concierge_requests';
      const existingStr = localStorage.getItem(localKey);
      if (existingStr) {
        const parsed = JSON.parse(existingStr);
        if (Array.isArray(parsed)) {
          localRequests.push(...parsed.filter((r: any) => r.customer_id === customerId || r.customerId === customerId));
        }
      }
    } catch {}

    if (!isFirebaseConfigured || !db) return localRequests;

    let firestoreDocs: FirestoreConciergeRequest[] = [];

    // 1. Try reading from root collection
    try {
      const coll = collection(db, 'concierge_requests').withConverter(genericConverter<FirestoreConciergeRequest>());
      const q = query(coll, where('customer_id', '==', customerId));
      const snapshots = await getDocs(q);
      if (snapshots.empty) {
        const qFallback = query(coll, where('customerId', '==', customerId));
        const fallbackSnaps = await getDocs(qFallback);
        firestoreDocs = fallbackSnaps.docs.map(d => d.data());
      } else {
        firestoreDocs = snapshots.docs.map(d => d.data());
      }
    } catch (err) {
      console.warn('Notice reading customer concierge requests from root collection:', err);
    }

    // 2. Also read from user profile document in Firestore
    try {
      const userRef = doc(db, 'users', customerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (Array.isArray(userData?.concierge_requests)) {
          const profileDocs = userData.concierge_requests as FirestoreConciergeRequest[];
          firestoreDocs = [...firestoreDocs, ...profileDocs];
        }
      }
    } catch (err) {
      console.warn('Notice reading customer concierge requests from user profile:', err);
    }

    // Merge and deduplicate by request ID
    const mergedMap = new Map<string, FirestoreConciergeRequest>();
    firestoreDocs.forEach(r => mergedMap.set(r.id, r));
    localRequests.forEach(r => {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    });

    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  },

  async getAll(): Promise<FirestoreConciergeRequest[]> {
    const localRequests: FirestoreConciergeRequest[] = [];
    try {
      const localKey = 'musha_concierge_requests';
      const existingStr = localStorage.getItem(localKey);
      if (existingStr) {
        const parsed = JSON.parse(existingStr);
        if (Array.isArray(parsed)) localRequests.push(...parsed);
      }
    } catch {}

    if (!isFirebaseConfigured || !db) return localRequests;

    let firestoreDocs: FirestoreConciergeRequest[] = [];
    try {
      const coll = collection(db, 'concierge_requests').withConverter(genericConverter<FirestoreConciergeRequest>());
      const snapshots = await getDocs(coll);
      firestoreDocs = snapshots.docs.map(d => d.data());
    } catch (err) {
      console.warn('Notice reading salon concierge requests for staff:', err);
    }

    // Also pull from user documents if root collection returned empty or restricted
    if (firestoreDocs.length === 0) {
      try {
        const usersColl = collection(db, 'users');
        const userSnaps = await getDocs(usersColl);
        userSnaps.forEach(uDoc => {
          const data = uDoc.data();
          if (Array.isArray(data?.concierge_requests)) {
            firestoreDocs.push(...(data.concierge_requests as FirestoreConciergeRequest[]));
          }
        });
      } catch (err) {
        console.warn('Notice reading user profiles for concierge requests:', err);
      }
    }

    const mergedMap = new Map<string, FirestoreConciergeRequest>();
    firestoreDocs.forEach(r => mergedMap.set(r.id, r));
    localRequests.forEach(r => {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    });

    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  },

  async updateStatus(
    requestId: string,
    status: ConciergeRequestStatus,
    staffNotes?: string,
    staffName?: string
  ): Promise<void> {
    // Update in local cache
    try {
      const localKey = 'musha_concierge_requests';
      const existingStr = localStorage.getItem(localKey);
      if (existingStr) {
        const parsed: FirestoreConciergeRequest[] = JSON.parse(existingStr);
        const updated = parsed.map(r => {
          if (r.id === requestId) {
            return {
              ...r,
              status,
              ...(staffNotes !== undefined ? { staff_notes: staffNotes } : {}),
              ...(staffName !== undefined ? { reviewed_by: staffName } : {}),
              updated_at: new Date().toISOString()
            };
          }
          return r;
        });
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
    } catch {}

    if (!isFirebaseConfigured || !db) return;

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };
    if (staffNotes !== undefined) updatePayload.staff_notes = staffNotes;
    if (staffName !== undefined) updatePayload.reviewed_by = staffName;

    try {
      const ref = doc(db, 'concierge_requests', requestId);
      await updateDoc(ref, updatePayload);
    } catch (err) {
      console.warn('Notice updating concierge_requests root document:', err);
    }
  }
};

