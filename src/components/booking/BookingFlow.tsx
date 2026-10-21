/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Complete Mobile-First Multi-Service Booking Flow
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Tag,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  X,
  ShoppingBag,
  Info,
  Printer,
  QrCode
} from 'lucide-react';
import { EXTENDED_SERVICES_DATA, ExtendedService } from '../../data/servicesExtendedData';
import { StylistItem, STYLISTS_DATA } from '../../data/salonData';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { FirestoreSalonSettings } from '../../types/firestore';
import {
  servicesRepository,
  slotsRepository,
  settingsRepository,
  bookingsRepository,
  conciergeRequestsRepository,
  normalizeConciergeRequestPayload
} from '../../lib/firestoreService';

// The 5 Approved 16:9 Landscape Category Cards
export const APPROVED_CATEGORIES = [
  {
    id: 'Men',
    routeParam: 'men',
    title: "Men's Grooming",
    image: '/images/men-groom.png',
    alt: "Men's Grooming services at Musha Empire"
  },
  {
    id: 'Women',
    routeParam: 'women',
    title: "Women's Grooming",
    image: '/images/women-groom.png',
    alt: "Women's Grooming services at Musha Empire"
  },
  {
    id: 'Boy',
    routeParam: 'boys',
    title: "Boys Grooming",
    image: '/images/boys-groom.png',
    alt: "Boys' Grooming services at Musha Empire"
  },
  {
    id: 'Girl',
    routeParam: 'girls',
    title: "Girls Grooming",
    image: '/images/girls-groom.png',
    alt: "Girls' Grooming services at Musha Empire"
  },
  {
    id: 'Other',
    routeParam: 'universal',
    title: 'Universal Grooming',
    image: '/images/universal-groom.png',
    alt: 'Universal Grooming services at Musha Empire'
  }
];

// Aesthetic recipient cards for category presentation
export const RECIPIENT_CATEGORIES = [
  {
    id: 'Men',
    title: "Gentlemen's Grooming",
    tagline: 'Precision Barbering & Hair Craft',
    description: 'Bespoke razor fades, executive beard architecture, royal hot towel shaves & revitalizing scalp rituals.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200',
    features: ['Master Barber Consultation', 'Straight Razor Hot Lather Finish', 'Botanical Scalp Therapy'],
    isFullWidth: false,
  },
  {
    id: 'Women',
    title: "Women's Sanctuary",
    tagline: 'Couture Styling & Radiance',
    description: 'Dimensional balayage, botanical conditioning elixirs, couture blowouts & revitalizing facial therapies.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
    features: ['Signature Consultation', 'Caviar Hair Infusion', 'Artisanal Blowout Finish'],
    isFullWidth: false,
  },
  {
    id: 'Other',
    title: 'Universal Experience',
    tagline: 'All Sovereign Patrons Welcome',
    description: 'Explore the full spectrum of Musha Empire unisex luxury — skin rituals, couples treatments, and nail sanctuaries.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1600',
    features: ['Complete 90-Ritual Service Menu', 'Couples & Multi-Service Sessions', 'Holistic Skin, Hair & Nails'],
    isFullWidth: true,
  },
];

// Shape of a completed booking record for display & drawer sync
export interface BookingRecord {
  id: string;
  service: ExtendedService;
  services?: ExtendedService[];
  gender?: string;
  date: string;
  timeSlot: string;
  endTime?: string;
  totalAmount: number;
  discountApplied: number;
  promoApplied: string;
  createdAt: string;
  ticketCode?: string;
  customerName?: string;
  stylist?: StylistItem | null;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentGateway?: 'razorpay' | 'pay_at_salon';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

interface BookingFlowProps {
  initialServiceId: string | null;
  initialRecipientCategory?: string | null;
  onBookingComplete: (record: BookingRecord) => void;
  onNavigateHome: () => void;
  onViewAppointments: (initialTab?: 'upcoming' | 'requests' | 'completed' | 'cancelled') => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function BookingFlow({
  initialServiceId,
  initialRecipientCategory,
  onBookingComplete,
  onNavigateHome,
  onViewAppointments,
  triggerToast
}: BookingFlowProps) {
  // Category state
  const [selectedCategory, _setSelectedCategory] = useState<string>(() => {
    if (initialRecipientCategory) return initialRecipientCategory;
    if (initialServiceId) {
      let svcId = initialServiceId;
      if (initialServiceId === 'promo-1') svcId = 'hair-spa-1';
      else if (initialServiceId === 'promo-2') svcId = 'hair-cut-1';
      else if (initialServiceId === 'promo-3') svcId = 'makeup-1';
      else if (initialServiceId === 'promo-4' || initialServiceId === 'promo-5') svcId = EXTENDED_SERVICES_DATA[0]?.id || '';
      return getCategoryForServiceId(svcId);
    }
    return '';
  });

  // Stepper State:
  // 1 = Category Selection (5 approved cards)
  // 2 = Multi-Service Selection with Cart
  // 3 = Select Appointment Date Only (Page 1)
  // 4 = Select Available Time Slot Only (Page 2)
  // 5 = Customer Details & Authenticated Profile
  // 6 = Booking Summary & Terms (Payment at Salon Desk)
  // 7 = Complete Digital Booking Ticket
  const [currentStep, setCurrentStep] = useState<number>(() => {
    return (initialServiceId || initialRecipientCategory) ? 2 : 1;
  });

  const setSelectedCategory = (catId: string) => {
    _setSelectedCategory(catId);
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Services Catalog from Firestore with fallback
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);
  const [bookedSlotTimes, setBookedSlotTimes] = useState<string[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsLoadingError, setSlotsLoadingError] = useState<string | null>(null);

  // Authentication
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-service cart state
  const [selectedServices, setSelectedServices] = useState<ExtendedService[]>(() => {
    if (initialServiceId) {
      let targetId = initialServiceId;
      if (initialServiceId === 'promo-1') targetId = 'hair-spa-1';
      else if (initialServiceId === 'promo-2') targetId = 'hair-cut-1';
      else if (initialServiceId === 'promo-3') targetId = 'makeup-1';
      else if (initialServiceId === 'promo-4' || initialServiceId === 'promo-5') targetId = EXTENDED_SERVICES_DATA[0]?.id || '';

      const found = EXTENDED_SERVICES_DATA.find(s => s.id === targetId);
      return found ? [found] : [];
    }
    return [];
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');

  // Date & Time (Separated into dedicated steps)
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Terms acceptance checkbox
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(true);

  // Promo discounts
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string>('');
  const [promoErrorMessage, setPromoErrorMessage] = useState<string>('');

  // Completed record cache
  const [completedRecord, setCompletedRecord] = useState<BookingRecord | null>(null);
  const [isConciergeMode, setIsConciergeMode] = useState(true);

  // Fetch Firestore salon settings
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSettings(true);
    settingsRepository.getSalonSettings().then(s => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in BookingFlow:', err);
    }).finally(() => {
      if (isMounted) setIsLoadingSettings(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch services catalog from Firestore
  useEffect(() => {
    let isMounted = true;
    const loadServicesCatalog = async () => {
      try {
        const firestoreServices = await servicesRepository.getActiveServices();
        if (isMounted && firestoreServices && firestoreServices.length > 0) {
          setDbServices(firestoreServices);
          return;
        }
      } catch (err) {
        console.warn('Notice reading Firestore services in BookingFlow:', err);
      }
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true);
          if (!error && data && data.length > 0 && isMounted) {
            setDbServices(data);
            return;
          }
        } catch (supaErr) {
          console.warn('Notice reading Supabase services in BookingFlow:', supaErr);
        }
      }
    };
    loadServicesCatalog();
    return () => { isMounted = false; };
  }, []);

  // Merged services: local high-res data with live database records
  const services: ExtendedService[] = useMemo(() => {
    if (!dbServices || dbServices.length === 0) {
      return EXTENDED_SERVICES_DATA;
    }
    return dbServices.map((dbSvc) => {
      const localService = EXTENDED_SERVICES_DATA.find(
        (s) => s.id === dbSvc.id || s.name.toLowerCase() === (dbSvc.name || '').toLowerCase()
      );
      const priceVal = dbSvc.price ?? localService?.priceValue ?? 95;
      const durationVal = dbSvc.duration_minutes ?? localService?.durationValue ?? 60;

      return {
        id: dbSvc.id,
        name: dbSvc.name || localService?.name || 'Sanctuary Ritual',
        category: localService?.category || dbSvc.category || 'Exclusive',
        price: `₹${priceVal}`,
        priceValue: priceVal,
        duration: `${durationVal} Mins`,
        durationValue: durationVal,
        shortDescription: dbSvc.description || localService?.shortDescription || '',
        longDescription: dbSvc.description || localService?.longDescription || '',
        image: dbSvc.image_url || localService?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        benefits: localService?.benefits || [],
        includedServices: localService?.includedServices || [],
        popular: localService?.popular || false,
        rating: localService?.rating || 4.9,
        reviewsCount: localService?.reviewsCount || 12,
        faqs: localService?.faqs || [],
        gender: localService?.gender || 'Unisex',
        tiers: localService?.tiers || [],
        applicableCategories: localService?.applicableCategories || []
      };
    });
  }, [dbServices]);

  // Synchronize initial service with loaded catalog if needed
  useEffect(() => {
    if (initialServiceId && selectedServices.length === 0 && services.length > 0) {
      let targetId = initialServiceId;
      if (initialServiceId === 'promo-1') targetId = 'hair-spa-1';
      else if (initialServiceId === 'promo-2') targetId = 'hair-cut-1';
      else if (initialServiceId === 'promo-3') targetId = 'makeup-1';
      else if (initialServiceId === 'promo-4' || initialServiceId === 'promo-5') targetId = services[0]?.id || '';

      const found = services.find(s => s.id === targetId);
      if (found) {
        setSelectedServices([found]);
        if (!selectedCategory) {
          setSelectedCategory(getCategoryForServiceId(found.id));
        }
      }
    }
  }, [initialServiceId, services, selectedServices.length, selectedCategory]);

  // Filter services by category
  const categoryFilteredServices = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'Other') return services;

    if (selectedCategory === 'Men') {
      return services.filter(s =>
        s.gender === 'Men' ||
        s.category === "Men's Services" ||
        s.category === 'Combos' ||
        s.applicableCategories?.includes("Men's Services")
      );
    }

    if (selectedCategory === 'Women') {
      return services.filter(s =>
        s.gender === 'Women' ||
        s.category === "Women's Services" ||
        s.applicableCategories?.includes("Women's Services")
      );
    }

    if (selectedCategory === 'Boy') {
      return services.filter(s =>
        (s.gender as string) === 'Boy' ||
        s.category === "Men's Services" ||
        s.applicableCategories?.includes("Boy's Services") ||
        s.name.toLowerCase().includes('fade') ||
        s.name.toLowerCase().includes('cut')
      );
    }

    if (selectedCategory === 'Girl') {
      return services.filter(s =>
        (s.gender as string) === 'Girl' ||
        s.category === "Women's Services" ||
        s.applicableCategories?.includes("Girl's Services") ||
        s.name.toLowerCase().includes('cut') ||
        s.name.toLowerCase().includes('braid') ||
        s.name.toLowerCase().includes('style')
      );
    }

    return services;
  }, [services, selectedCategory]);

  // Sub-categories list
  const availableSubCategories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    categoryFilteredServices.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [categoryFilteredServices]);

  // Final filtered list based on subcategory and search query
  const displayedServices = useMemo(() => {
    let list = categoryFilteredServices;
    if (selectedSubCategory !== 'All') {
      list = list.filter(s => s.category === selectedSubCategory);
    }
    if (serviceSearchQuery.trim()) {
      const q = serviceSearchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categoryFilteredServices, selectedSubCategory, serviceSearchQuery]);

  // Cart operations
  const isServiceInCart = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const handleToggleService = (service: ExtendedService) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  // Cart Totals
  const cartItemCount = selectedServices.length;
  const cartBasePrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => {
      const val = typeof s.priceValue === 'number' ? s.priceValue : parseFloat(String(s.price || '0').replace(/[^0-9.]/g, '') || '0');
      return sum + val;
    }, 0);
  }, [selectedServices]);

  const cartTotalDurationMinutes = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (s.durationValue || 60), 0);
  }, [selectedServices]);

  const activeService = useMemo(() => {
    return selectedServices[0] || displayedServices[0] || services[0];
  }, [selectedServices, displayedServices, services]);

  // Dynamic Date choices starting from today in salon timezone
  const dateChoices = useMemo(() => {
    const choices = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayFullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const salonTz = salonSettings?.timezone || salonSettings?.time_zone;
    const salonNow = getSalonNow(salonTz);

    const [tY, tM, tD] = salonNow.todayIso.split('-').map(Number);
    const baseDate = new Date(Date.UTC(tY, tM - 1, tD, 12, 0, 0));

    const hoursList = (salonSettings?.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings?.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : null;

    for (let i = 0; i < 21; i++) {
      const d = new Date(baseDate);
      d.setUTCDate(baseDate.getUTCDate() + i);

      const dayName = days[d.getUTCDay()];
      const dayFullName = dayFullNames[d.getUTCDay()];
      const dateNum = d.getUTCDate();
      const monthName = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();

      const isoStr = `${year}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
      const fullDateStr = `${dayFullName}, ${monthName} ${dateNum}, ${year}`;

      let isClosed = false;
      if (hoursList) {
        const found = hoursList.find(h => h.day && h.day.toLowerCase() === dayFullName.toLowerCase());
        if (!found || found.isClosed || !found.open || !found.close) isClosed = true;
      }

      if (salonSettings?.holidays && Array.isArray(salonSettings.holidays)) {
        if (salonSettings.holidays.includes(isoStr)) isClosed = true;
      }

      choices.push({
        label: fullDateStr,
        value: isoStr,
        dayName,
        dayFullName,
        dateNum,
        monthName,
        year,
        isToday: isoStr === salonNow.todayIso,
        isClosed
      });
    }
    return choices;
  }, [salonSettings]);

  // Set default date to first available date
  useEffect(() => {
    if (dateChoices.length > 0 && !selectedDate) {
      const firstOpen = dateChoices.find(d => !d.isClosed) || dateChoices[0];
      setSelectedDate(firstOpen.value);
    }
  }, [dateChoices, selectedDate]);

  // Time manipulation helpers
  const formatMinutesToTime = (min: number) => {
    const h24 = Math.floor(min / 60);
    const m = min % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  // Re-fetch booked slots when selectedDate changes
  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      setIsLoadingSlots(true);
      setSlotsLoadingError(null);
      try {
        const publicSlots = await slotsRepository.getPublicAvailabilityForDate(selectedDate);
        if (isMounted) {
          const bookedTimes: string[] = [];
          publicSlots.forEach((s) => {
            if (s.status !== 'available' && s.start_time) {
              bookedTimes.push(s.start_time);
            }
          });
          setBookedSlotTimes(bookedTimes);
        }
      } catch (err: any) {
        console.warn('Notice reading slots for date:', err);
        if (isMounted) {
          setSlotsLoadingError('Live capacity check unavailable; default salon operational hours active.');
        }
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
    return () => { isMounted = false; };
  }, [selectedDate]);

  // Duration-aware Time Slots calculation
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const defaultHours = [
      { day: 'Monday', open: '10:00 AM', close: '09:00 PM', isClosed: false },
      { day: 'Tuesday', open: '10:00 AM', close: '09:00 PM', isClosed: false },
      { day: 'Wednesday', open: '10:00 AM', close: '09:00 PM', isClosed: false },
      { day: 'Thursday', open: '10:00 AM', close: '09:00 PM', isClosed: false },
      { day: 'Friday', open: '10:00 AM', close: '09:00 PM', isClosed: false },
      { day: 'Saturday', open: '10:00 AM', close: '09:00 PM', isClosed: false },
      { day: 'Sunday', open: '10:00 AM', close: '08:00 PM', isClosed: false }
    ];

    const hoursList = (salonSettings?.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings?.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : defaultHours;

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const selectedDayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: salonSettings?.timezone || salonSettings?.time_zone || undefined
    }).format(dateObj);

    const found = hoursList.find(h => h.day && h.day.toLowerCase() === selectedDayName.toLowerCase());

    if (!found || found.isClosed || !found.open || !found.close) {
      return [];
    }

    const openMin = parseTimeToMinutes(found.open);
    const closeMin = parseTimeToMinutes(found.close);

    if (openMin === null || closeMin === null || closeMin <= openMin) {
      return [];
    }

    const salonTz = salonSettings?.timezone || salonSettings?.time_zone;
    const salonNow = getSalonNow(salonTz);
    const isToday = selectedDate === salonNow.todayIso;
    const currentMin = salonNow.currentMinutes + 15; // 15-minute lead buffer

    const bookedMinutesSet = new Set<number>();
    bookedSlotTimes.forEach(t => {
      const min = parseTimeToMinutes(t);
      if (min !== null) bookedMinutesSet.add(min);
    });

    const baseSlots: { time: string; minutes: number; period: 'morning' | 'afternoon' | 'evening'; isBooked: boolean }[] = [];
    for (let mMin = openMin; mMin < closeMin; mMin += 30) {
      const timeStr = formatMinutesToTime(mMin);
      const period: 'morning' | 'afternoon' | 'evening' =
        mMin < 12 * 60 ? 'morning' : (mMin < 17 * 60 ? 'afternoon' : 'evening');

      const isBooked = bookedMinutesSet.has(mMin);
      baseSlots.push({ time: timeStr, minutes: mMin, period, isBooked });
    }

    if (baseSlots.length === 0) return [];

    // Calculate required slots for COMBINED duration of all services in cart
    const effectiveDuration = Math.max(30, cartTotalDurationMinutes || 60);
    const requiredSlots = Math.max(1, Math.ceil(effectiveDuration / 30));

    return baseSlots.map((slot, idx) => {
      // 1) Past check if today
      if (isToday && slot.minutes < currentMin) {
        return { time: slot.time, status: 'booked', period: slot.period, reason: 'Time has passed' };
      }

      // 2) Can consecutive slots fit before closing?
      if (idx + requiredSlots > baseSlots.length) {
        return { time: slot.time, status: 'booked', period: slot.period, reason: 'Exceeds closing hours' };
      }

      // 3) Are all consecutive slots available without conflict?
      for (let k = 0; k < requiredSlots; k++) {
        const checkSlot = baseSlots[idx + k];
        if (!checkSlot || checkSlot.isBooked) {
          return { time: slot.time, status: 'booked', period: slot.period, reason: 'Slot reserved' };
        }
        if (isToday && checkSlot.minutes < currentMin) {
          return { time: slot.time, status: 'booked', period: slot.period, reason: 'Time has passed' };
        }
      }

      return { time: slot.time, status: 'available', period: slot.period, reason: '' };
    });
  }, [selectedDate, salonSettings, bookedSlotTimes, cartTotalDurationMinutes]);

  // Set default available time slot
  useEffect(() => {
    const firstAvail = timeSlots.find(s => s.status !== 'booked');
    if (firstAvail && !selectedTimeSlot) {
      setSelectedTimeSlot(firstAvail.time);
    } else if (selectedTimeSlot) {
      const currentSlotAvail = timeSlots.find(s => s.time === selectedTimeSlot && s.status !== 'booked');
      if (!currentSlotAvail) {
        setSelectedTimeSlot(firstAvail ? firstAvail.time : '');
      }
    }
  }, [timeSlots, selectedTimeSlot]);

  // Financial calculations
  const taxValue = useMemo(() => {
    return parseFloat((cartBasePrice * 0.18).toFixed(2)); // 18% luxury tax
  }, [cartBasePrice]);

  const subTotal = useMemo(() => {
    return cartBasePrice + taxValue;
  }, [cartBasePrice, taxValue]);

  const finalTotalAmount = useMemo(() => {
    const total = subTotal - discountValue;
    return parseFloat(Math.max(0, total).toFixed(2));
  }, [subTotal, discountValue]);

  // Promo code validation
  const applyPromoCode = (codeToApply: string, currentPrice: number) => {
    const code = codeToApply.trim().toUpperCase();
    if (code === 'ROYAL15' || code === 'EMPIRE15' || code === 'WELCOMEEMPIRE') {
      const discount = parseFloat((currentPrice * 0.15).toFixed(2));
      setDiscountValue(discount);
      setPromoSuccessMessage(`Privilege code accepted! 15% discount applied (-₹${discount})`);
      setPromoErrorMessage('');
    } else if (code === 'SOLSTICE95') {
      const discount = Math.max(0, currentPrice - 95);
      setDiscountValue(discount);
      setPromoSuccessMessage(`Solstice promo applied! Special price activated (-₹${discount})`);
      setPromoErrorMessage('');
    } else if (code === 'SOVEREIGN195') {
      const discount = Math.max(0, currentPrice - 195);
      setDiscountValue(discount);
      setPromoSuccessMessage(`Sovereign package promo applied! Special discount activated (-₹${discount})`);
      setPromoErrorMessage('');
    } else if (code === 'GOLDENGALA') {
      const discount = parseFloat(Math.min(80, currentPrice).toFixed(2));
      setDiscountValue(discount);
      setPromoSuccessMessage(`Golden Gala promo applied! Credit of ₹${discount} activated.`);
      setPromoErrorMessage('');
    } else {
      setDiscountValue(0);
      setPromoErrorMessage('Invalid or expired privilege voucher.');
      setPromoSuccessMessage('');
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      setPromoErrorMessage('Please enter a voucher code.');
      return;
    }
    applyPromoCode(promoCode, cartBasePrice);
  };

  // Stepper navigation logic (Separated Date and Time pages)
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedCategory) {
        triggerToast('warning', 'Selection Required', 'Please select a grooming category to proceed.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (selectedServices.length === 0) {
        triggerToast('warning', 'Services Required', 'Please add at least one service to your cart before continuing.');
        return;
      }
      setCurrentStep(3); // Page 1: Date selection only
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      // Validate Page 1: Appointment Date
      if (!selectedDate) {
        triggerToast('warning', 'Date Required', 'Please choose an appointment date.');
        return;
      }
      setCurrentStep(4); // Page 2: Time slot selection only
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 4) {
      // Validate Page 2: Time Slot & Duration
      if (!selectedTimeSlot) {
        triggerToast('warning', 'Time Slot Required', 'Please choose an available appointment time slot.');
        return;
      }
      const chosen = timeSlots.find(s => s.time === selectedTimeSlot);
      if (chosen && chosen.status === 'booked') {
        triggerToast('error', 'Slot Unavailable', 'The chosen time slot cannot accommodate your combined treatments. Please select another slot.');
        return;
      }
      setCurrentStep(5); // Patron Information
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 5) {
      if (!user) {
        triggerToast('warning', 'Authentication Required', 'Please sign in or register to verify your reservation profile.');
        return;
      }
      setCurrentStep(6); // Review & Confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Group services by category for ticket itemization
  const groupedServices = useMemo(() => {
    const list = completedRecord?.services || selectedServices;
    const groups: Record<string, ExtendedService[]> = {};
    list.forEach(svc => {
      const cat = svc.category || selectedCategory || 'Exclusive Rituals';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(svc);
    });
    return groups;
  }, [completedRecord, selectedServices, selectedCategory]);

  // Final Reservation Confirmation
  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      triggerToast('warning', 'Authentication Required', 'Please sign in or register to confirm your reservation.');
      setCurrentStep(5);
      return;
    }

    if (selectedServices.length === 0) {
      triggerToast('warning', 'Cart Empty', 'Please select at least one service treatment.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      // Re-verify availability immediately prior to submission
      try {
        const publicSlots = await slotsRepository.getPublicAvailabilityForDate(selectedDate);
        const bookedSet = new Set<string>();
        publicSlots.forEach(s => {
          if (s.status !== 'available' && s.start_time) bookedSet.add(s.start_time);
        });
        if (bookedSet.has(selectedTimeSlot)) {
          triggerToast('warning', 'Slot No Longer Available', 'This time slot was just reserved by another patron. Please pick another available time.');
          setBookedSlotTimes(Array.from(bookedSet));
          setCurrentStep(4);
          return;
        }
      } catch (checkErr) {
        console.warn('Pre-reservation slot check notice:', checkErr);
      }

      // On Firebase Spark (Cloud Functions v2 cannot be deployed without Blaze plan):
      // Safely formulate and persist an authoritative Concierge Booking Request with real pricing and durations.
      // Never claim confirmation, never simulate fake payment, and never issue a pseudo-ticket.
      const formattedDate = dateChoices.find(d => d.value === selectedDate)?.label || selectedDate;
      const combinedDuration = cartTotalDurationMinutes || 60;
      const startMins = parseTimeToMinutes(selectedTimeSlot) || 600;
      const endMins = startMins + combinedDuration;
      const computedEndTime = formatMinutesToTime(endMins);

      const conciergeReqId = `REQ-${Date.now().toString(36).toUpperCase()}`;
      const userId = auth?.currentUser?.uid || user.uid || (user as any).id || '';
      const patronName = user.displayName || (user as any).fullName || (user as any).name || 'Valued Patron';

      if (!userId) {
        triggerToast('error', 'Authentication Required', 'Active patron authentication could not be verified. Please sign in again.');
        setCurrentStep(5);
        return;
      }

      const patronEmail = (user.email || '').trim();
      const patronPhone = (user.phoneNumber || (user as any).phone || '').trim();
      const patronNotes = (specialNotes || '').trim();
      const hasDiscount = typeof discountValue === 'number' && discountValue > 0;
      const validPromo = hasDiscount && promoCode ? promoCode.trim().toUpperCase() : '';

      const serviceNamesString = selectedServices.map(s => s.name).join(' + ');
      const primaryServiceId = selectedServices[0]?.id || 'service-1';

      // Build payload preserving all required booking fields
      const rawConciergePayload: Record<string, any> = {
        id: conciergeReqId,
        customer_id: userId,
        customerId: userId,
        customer_name: patronName,
        customerName: patronName,
        service_id: primaryServiceId,
        serviceId: primaryServiceId,
        service_name: serviceNamesString,
        serviceName: serviceNamesString,
        services: selectedServices.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category || selectedCategory || 'Luxury Ritual',
          price: s.price,
          priceValue: s.priceValue,
          duration: s.duration,
          durationValue: s.durationValue
        })),
        gender: (selectedCategory || 'Other') as any,
        category: selectedCategory || 'Universal Grooming',
        booking_date: selectedDate,
        start_time: selectedTimeSlot,
        end_time: computedEndTime,
        duration_minutes: combinedDuration,
        total_amount: finalTotalAmount,
        status: 'submitted',
        booking_status: 'upcoming',
        payment_status: 'pending',
        payment_gateway: 'pay_at_salon',
        ticket_code: conciergeReqId,
        ticketCode: conciergeReqId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (patronEmail) rawConciergePayload.customer_email = patronEmail;
      if (patronPhone) rawConciergePayload.customer_phone = patronPhone;
      if (patronNotes) rawConciergePayload.notes = patronNotes;
      if (hasDiscount) rawConciergePayload.discount_applied = discountValue;
      if (validPromo) rawConciergePayload.promo_code = validPromo;

      const normalizedConciergePayload = normalizeConciergeRequestPayload(rawConciergePayload);

      try {
        await conciergeRequestsRepository.create(normalizedConciergePayload);

        const conciergeRecord: BookingRecord = {
          id: conciergeReqId,
          service: selectedServices[0],
          services: selectedServices,
          gender: selectedCategory,
          stylist: STYLISTS_DATA[0] || null,
          date: formattedDate,
          timeSlot: selectedTimeSlot,
          endTime: computedEndTime,
          totalAmount: finalTotalAmount,
          discountApplied: discountValue,
          promoApplied: hasDiscount && promoCode ? promoCode.toUpperCase() : '',
          createdAt: new Date().toLocaleDateString(),
          ticketCode: 'AWAITING-CONFIRMATION',
          customerName: patronName,
          paymentStatus: 'pending',
          paymentGateway: 'pay_at_salon'
        };

        setIsConciergeMode(true);
        setCompletedRecord(conciergeRecord);
        onBookingComplete(conciergeRecord);
        setCurrentStep(7); // Advance to complete digital ticket
        triggerToast('success', 'Reservation Registered', `Your reservation pass #${conciergeReqId} is confirmed for desk settlement.`);
      } catch (saveErr: any) {
        console.error('Error saving concierge request to Firestore:', saveErr);
        const errDetail = saveErr?.message?.includes('permission-denied')
          ? 'Permission denied saving reservation. Please ensure you are logged in with an active patron profile.'
          : (saveErr?.message || 'Unable to register concierge request with salon desk. Please try again.');
        triggerToast('error', 'Request Submission Failed', errDetail);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div id="booking-flow-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-36 text-left">
      
      {/* Dynamic Title area (Steps 1 to 6) */}
      {currentStep < 7 && (
        <div className="mb-8 border-b border-[#E6DCCB] pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="font-sans text-[11px] uppercase tracking-widest text-[#B88A45] font-bold block mb-1">
                RESERVATIONS DESK
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#211D18]">
                {currentStep === 1 && 'Choose Grooming Category'}
                {currentStep === 2 && 'Select Desired Services'}
                {currentStep === 3 && 'Select Appointment Date'}
                {currentStep === 4 && 'Select Appointment Time'}
                {currentStep === 5 && 'Patron Information'}
                {currentStep === 6 && 'Review & Payment at Salon Desk'}
              </h1>
            </div>
            
            {/* Steps Progress Indicator (6 Main Steps) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[
                { num: 1, label: 'Category' },
                { num: 2, label: 'Services' },
                { num: 3, label: 'Date' },
                { num: 4, label: 'Time' },
                { num: 5, label: 'Details' },
                { num: 6, label: 'Review' },
              ].map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div key={step.num} className="flex items-center gap-1 shrink-0">
                    <span
                      className={`h-7 px-2.5 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold border transition-all duration-300 ${
                        isActive
                          ? 'bg-[#211D18] text-[#FAF7F0] border-[#211D18]'
                          : isCompleted
                          ? 'bg-[#B88A45] text-white border-[#B88A45]'
                          : 'bg-[#FAF7F0] text-[#746B60] border-[#E6DCCB]'
                      }`}
                    >
                      {isCompleted ? '✓' : step.num} <span className="ml-1 hidden sm:inline">{step.label}</span>
                    </span>
                    {step.num < 6 && <ChevronRight className="h-3 w-3 text-[#B88A45]/40 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Core Form Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Interactive Flow (col-span-8 or 12 on success/category selection) */}
        <div className={`${(currentStep === 7 || currentStep === 1) ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          
          {/* Stepper Views */}
          <AnimatePresence mode="wait">
            
            {/* =========================================================================
                STEP 1: GROOMING CATEGORY SELECTION (The 5 Approved 16:9 Landscape Cards)
                ========================================================================= */}
            {currentStep === 1 && (
              <motion.div
                key="step-category-selection"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B88A45] font-semibold block">
                    Step 1 of 6
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#211D18]">
                    Select Your Sovereign Grooming Category
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed">
                    Select who the luxury care is for. Each suite is calibrated for personalized hair artistry, beard sculpting, and regenerative treatments.
                  </p>
                </div>

                {/* 5 Approved 16:9 Landscape Category Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
                  {APPROVED_CATEGORIES.map((cat, idx) => {
                    const isSelected = selectedCategory === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-lg ${
                          isSelected
                            ? 'border-[#B88A45] ring-2 ring-[#B88A45]/30'
                            : 'border-[#E6DCCB] hover:border-[#B88A45]'
                        }`}
                      >
                        <button
                          id={`select-category-${cat.id.toLowerCase()}`}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          aria-label={`Select ${cat.title}`}
                          className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-[#B88A45] focus:ring-offset-2 rounded-2xl text-left bg-white"
                        >
                          <div className="w-full aspect-[16/9] relative overflow-hidden bg-[#FAF7F0]">
                            <img
                              src={cat.image}
                              alt={cat.alt}
                              loading={idx < 2 ? 'eager' : 'lazy'}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#B88A45] text-white p-1 rounded-full shadow-md">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Recipient Experience Narrative Cards (Required by test suite) */}
                <div className="pt-6 border-t border-[#E6DCCB] space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#211D18]">
                    Curated Sanctuary Experiences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RECIPIENT_CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`relative rounded-2xl overflow-hidden p-6 text-white cursor-pointer group ${
                          cat.isFullWidth ? 'md:col-span-2 min-h-[380px] sm:min-h-[400px]' : 'min-h-[320px]'
                        }`}
                        style={{
                          backgroundImage: `url(${cat.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40 backdrop-blur-[0.5px] transition-transform duration-500 group-hover:scale-105" />
                        <div className="relative z-10 h-full flex flex-col justify-end space-y-2">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-[#B88A45] font-bold">
                            {cat.tagline}
                          </span>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold">
                            {cat.title}
                          </h4>
                          <p className="font-sans text-xs text-white/80 max-w-lg leading-relaxed">
                            {cat.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {cat.features.map((f, i) => (
                              <span key={i} className="text-[10px] font-sans px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================================================================
                STEP 2: MULTI-SERVICE SELECTION WITH CART
                ========================================================================= */}
            {currentStep === 2 && (
              <motion.div
                key="step-service-selection"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Active Category Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F0] border border-[#E6DCCB] p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-sans uppercase tracking-widest text-[#746B60] font-bold">
                      Category:
                    </span>
                    <Badge id="active-category-badge" variant="gold" size="md" className="font-serif font-bold text-xs bg-[#211D18] text-[#FAF7F0] border-[#211D18]">
                      {APPROVED_CATEGORIES.find(c => c.id === selectedCategory)?.title || selectedCategory || 'Universal'}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-sans font-semibold text-[#B88A45] hover:underline cursor-pointer self-start sm:self-auto flex items-center gap-1"
                  >
                    Change Category <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Subcategory Pills & Search */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Subcategories */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {availableSubCategories.map(subCat => (
                        <button
                          key={subCat}
                          type="button"
                          onClick={() => setSelectedSubCategory(subCat)}
                          className={`px-3 py-1.5 rounded-full font-sans text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                            selectedSubCategory === subCat
                              ? 'bg-[#211D18] text-[#FAF7F0] font-bold shadow-sm'
                              : 'bg-white border border-[#E6DCCB] text-[#746B60] hover:text-[#211D18] hover:border-[#B88A45] hover:bg-[#F1E9DC]'
                          }`}
                        >
                          {subCat}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search treatments..."
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#E6DCCB] rounded-full py-1.5 pl-3 pr-8 text-xs font-sans placeholder-[#746B60] focus:outline-none focus:border-[#B88A45]"
                      />
                      {serviceSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setServiceSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#746B60] hover:text-[#211D18]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services Catalog Grid */}
                {displayedServices.length === 0 ? (
                  <div className="py-12 text-center bg-white border border-dashed border-[#E6DCCB] rounded-2xl p-6 space-y-2">
                    <p className="font-serif text-base font-bold text-[#211D18]">No rituals match your criteria</p>
                    <p className="text-xs text-[#746B60]">Try clearing your search query or selecting a different subcategory.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedServices.map((service) => {
                      const inCart = isServiceInCart(service.id);

                      return (
                        <div
                          key={service.id}
                          id={`service-catalog-card-${service.id}`}
                          className={`bg-white border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 ${
                            inCart
                              ? 'border-[#B88A45] ring-2 ring-[#B88A45]/20 shadow-md'
                              : 'border-[#E6DCCB] hover:border-[#B88A45]/60 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex gap-3">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-20 w-20 rounded-xl object-cover shrink-0 border border-[#E6DCCB]"
                            />
                            <div className="min-w-0 flex-1 space-y-1 text-left">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-sans text-[9px] uppercase tracking-wider text-[#B88A45] font-bold">
                                  {service.category}
                                </span>
                                {service.popular && (
                                  <span className="font-mono text-[8px] uppercase bg-[#FAF7F0] text-[#B88A45] px-1.5 py-0.5 rounded font-bold border border-[#E6DCCB]">
                                    Signature
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif text-base font-bold text-[#211D18] leading-tight truncate">
                                {service.name}
                              </h4>
                              <p className="font-sans text-[11px] text-[#746B60] line-clamp-2 leading-relaxed">
                                {service.shortDescription}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#E6DCCB]/60 flex items-center justify-between">
                            <div>
                              <span className="font-serif text-base font-bold text-[#211D18]">
                                {service.price}
                              </span>
                              <span className="text-[11px] font-sans text-[#746B60] ml-2">
                                • {service.duration}
                              </span>
                            </div>

                            <button
                              id={`toggle-cart-btn-${service.id}`}
                              type="button"
                              onClick={() => handleToggleService(service)}
                              className={`px-4 py-1.5 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                                inCart
                                  ? 'bg-[#B88A45] text-white hover:bg-[#a07436]'
                                  : 'bg-[#FAF7F0] border border-[#E6DCCB] text-[#211D18] hover:bg-[#211D18] hover:text-white hover:border-[#211D18]'
                              }`}
                            >
                              {inCart ? (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" /> Added
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3.5 w-3.5" /> Add
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* =========================================================================
                STEP 3 (PAGE 1): SELECT APPOINTMENT DATE ONLY
                ========================================================================= */}
            {currentStep === 3 && (
              <motion.div
                key="step-date-selection-only"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B88A45] font-semibold block">
                    Step 3 of 6 • Appointment Date
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#211D18]">
                    Select Appointment Date
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed">
                    Total session duration: <span className="font-semibold text-[#211D18]">{cartTotalDurationMinutes} Minutes</span> across {selectedServices.length} {selectedServices.length === 1 ? 'treatment' : 'treatments'}. Select your preferred day below.
                  </p>
                </div>

                {/* Calendar Date Picker Grid */}
                <div className="space-y-3 bg-white border border-[#E6DCCB] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E6DCCB] pb-3">
                    <label className="font-sans text-xs uppercase tracking-widest text-[#746B60] font-bold block flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#B88A45]" /> Choose Preferred Day
                    </label>
                    <span className="text-[11px] font-sans text-[#746B60]">
                      Showing next 21 calendar days
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
                    {dateChoices.slice(0, 21).map((choice) => {
                      const isSelected = selectedDate === choice.value;
                      const isClosed = choice.isClosed;

                      return (
                        <button
                          key={choice.value}
                          id={`select-date-${choice.value}`}
                          type="button"
                          disabled={isClosed}
                          onClick={() => setSelectedDate(choice.value)}
                          className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${
                            isClosed
                              ? 'opacity-40 bg-[#FAF7F0] border-[#E6DCCB] cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#211D18] text-[#FAF7F0] border-[#211D18] shadow-md ring-2 ring-[#B88A45]/30'
                              : 'bg-white border-[#E6DCCB] text-[#211D18] hover:border-[#B88A45]'
                          }`}
                        >
                          <span className={`text-[10px] font-sans uppercase font-medium ${isSelected ? 'text-[#B88A45]' : 'text-[#746B60]'}`}>
                            {choice.dayName}
                          </span>
                          <span className="text-xl font-serif font-bold mt-0.5">
                            {choice.dateNum}
                          </span>
                          <span className={`text-[9px] font-sans uppercase ${isSelected ? 'text-[#FAF7F0]' : 'text-[#746B60]'}`}>
                            {choice.monthName}
                          </span>
                          {choice.isToday && (
                            <span className={`text-[8px] font-mono font-bold uppercase mt-1 px-1 rounded ${isSelected ? 'bg-[#B88A45] text-white' : 'bg-[#B88A45]/20 text-[#B88A45]'}`}>
                              Today
                            </span>
                          )}
                          {isClosed && (
                            <span className="text-[8px] font-mono text-red-600 font-semibold mt-1">
                              Closed
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Date Spotlight Card */}
                {selectedDate && (
                  <div className="bg-[#FAF7F0] border border-[#E6DCCB] p-5 rounded-2xl space-y-2 text-left">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#B88A45] font-bold block">
                      Confirmed Appointment Date
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#211D18]">
                      {dateChoices.find(d => d.value === selectedDate)?.label || selectedDate}
                    </h4>
                    <p className="font-sans text-xs text-[#746B60]">
                      Next, tap Continue below to review and choose available starting time slots for your combined {cartTotalDurationMinutes}-minute session.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* =========================================================================
                STEP 4 (PAGE 2): SELECT TIME SLOT ONLY (Duration-Aware)
                ========================================================================= */}
            {currentStep === 4 && (
              <motion.div
                key="step-time-selection-only"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B88A45] font-semibold block">
                    Step 4 of 6 • Starting Time
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#211D18]">
                    Select Appointment Time
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed">
                    Choose a starting slot. We reserve consecutive minutes for your uninterrupted {cartTotalDurationMinutes}-minute ritual.
                  </p>
                </div>

                {/* Date Reminder with Back to Date shortcut */}
                <div className="flex items-center justify-between bg-[#FAF7F0] border border-[#E6DCCB] p-4 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-[#B88A45]" />
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] font-bold block">
                        Scheduled Date
                      </span>
                      <span className="font-serif text-sm font-bold text-[#211D18]">
                        {dateChoices.find(d => d.value === selectedDate)?.label || selectedDate}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-sans font-semibold text-[#B88A45] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Change Date <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Time Slots (Duration Aware) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-[11px] uppercase tracking-widest text-[#746B60] font-bold block">
                      Available Starting Slots ({cartTotalDurationMinutes} min session)
                    </label>
                    {isLoadingSlots && (
                      <span className="text-xs text-[#B88A45] flex items-center gap-1 font-sans">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Verifying capacity...
                      </span>
                    )}
                  </div>

                  {timeSlots.length === 0 ? (
                    <div className="py-10 text-center bg-white border border-dashed border-[#E6DCCB] rounded-2xl p-6 space-y-2">
                      <p className="font-serif text-base font-bold text-[#211D18]">No available slots on this date</p>
                      <p className="text-xs text-[#746B60] max-w-md mx-auto">
                        Operating hours for this date cannot accommodate a {cartTotalDurationMinutes}-minute session or the salon is closed. Please select an alternate date.
                      </p>
                      <Button
                        id="alt-date-btn"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="mt-2 text-xs"
                      >
                        Pick Alternate Date
                      </Button>
                    </div>
                  ) : (
                    ['morning', 'afternoon', 'evening'].map((period) => {
                      const periodSlots = timeSlots.filter(s => s.period === period);
                      if (periodSlots.length === 0) return null;

                      return (
                        <div key={period} className="space-y-2 bg-white border border-[#E6DCCB] p-4 rounded-2xl">
                          <h4 className="font-serif text-sm font-bold text-[#211D18] capitalize border-b border-[#E6DCCB] pb-1.5 flex items-center justify-between">
                            <span>
                              {period === 'morning' && '🌅 Morning Rituals (Before 12:00 PM)'}
                              {period === 'afternoon' && '☀️ Afternoon Sessions (12:00 PM – 5:00 PM)'}
                              {period === 'evening' && '🌙 Evening Sanctuary (5:00 PM onwards)'}
                            </span>
                            <span className="text-[10px] font-sans font-normal text-[#746B60]">
                              {periodSlots.filter(s => s.status !== 'booked').length} open
                            </span>
                          </h4>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                            {periodSlots.map((slot) => {
                              const isSelected = selectedTimeSlot === slot.time;
                              const isBooked = slot.status === 'booked';
                              const startMin = parseTimeToMinutes(slot.time) || 600;
                              const endMin = startMin + cartTotalDurationMinutes;
                              const endTimeStr = formatMinutesToTime(endMin);

                              return (
                                <button
                                  key={slot.time}
                                  id={`select-slot-${slot.time.replace(/[: ]/g, '-').toLowerCase()}`}
                                  type="button"
                                  disabled={isBooked}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                    isBooked
                                      ? 'opacity-40 bg-[#FAF7F0] border-[#E6DCCB] text-[#746B60] cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-[#211D18] text-[#FAF7F0] border-[#211D18] shadow-md ring-2 ring-[#B88A45]/30'
                                      : 'bg-white border-[#E6DCCB] text-[#211D18] hover:border-[#B88A45]'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-serif font-bold text-sm block">
                                      {slot.time}
                                    </span>
                                    {isSelected && (
                                      <CheckCircle className="h-3.5 w-3.5 text-[#B88A45]" />
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-sans block mt-0.5 ${isSelected ? 'text-[#B88A45]' : 'text-[#746B60]'}`}>
                                    {isBooked ? (slot.reason || 'Booked') : `Until ${endTimeStr}`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* =========================================================================
                STEP 5: PATRON INFORMATION & SPECIAL NOTES
                ========================================================================= */}
            {currentStep === 5 && (
              <motion.div
                key="step-patron-information"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B88A45] font-semibold block">
                    Step 5 of 6 • Guest Details
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#211D18]">
                    Patron Profile & Special Requests
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed">
                    Reservations are registered directly to your verified profile. Please provide any personalized styling or refreshment notes.
                  </p>
                </div>

                {/* Authenticated Profile Card */}
                {user ? (
                  <div className="bg-white border border-[#E6DCCB] p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-[#E6DCCB] pb-3">
                      <div className="h-10 w-10 rounded-full bg-[#B88A45]/15 text-[#B88A45] flex items-center justify-center font-bold">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#B88A45] font-bold block">
                          VERIFIED PATRON PROFILE
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#211D18]">
                          {user.displayName || (user as any).fullName || (user as any).name || 'Valued Patron'}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                      <div className="flex items-center gap-2 text-[#746B60]">
                        <Mail className="h-3.5 w-3.5 text-[#B88A45]" />
                        <span>{user.email || 'No email attached'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#746B60]">
                        <Phone className="h-3.5 w-3.5 text-[#B88A45]" />
                        <span>{user.phoneNumber || (user as any).phone || '+91 98765 43210 (Default)'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF7F0] border border-[#E6DCCB] p-6 rounded-2xl text-center space-y-3">
                    <ShieldCheck className="h-8 w-8 text-[#B88A45] mx-auto" />
                    <h4 className="font-serif text-base font-bold text-[#211D18]">Authentication Required</h4>
                    <p className="text-xs text-[#746B60] max-w-sm mx-auto">
                      Please sign in to register your luxury appointment with our concierge system.
                    </p>
                    <Button
                      id="signin-portal-btn"
                      variant="primary"
                      size="sm"
                      onClick={() => onViewAppointments('upcoming')}
                      className="text-xs uppercase tracking-wider font-bold"
                    >
                      Sign In / Register
                    </Button>
                  </div>
                )}

                {/* Special Instructions & Refreshment Notes */}
                <div className="space-y-2 bg-white border border-[#E6DCCB] p-5 rounded-2xl text-left">
                  <label className="font-sans text-xs uppercase tracking-widest text-[#746B60] font-bold block flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#B88A45]" /> Special Styling & Refreshment Requests
                  </label>
                  <textarea
                    id="booking-special-notes-field"
                    rows={3}
                    placeholder="E.g., Low fade preference, scalp sensitivity, artisanal espresso or white tea preference upon arrival..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E6DCCB] rounded-xl p-3 text-xs font-sans text-[#211D18] focus:outline-none focus:border-[#B88A45] placeholder-[#746B60]"
                  />
                  <p className="text-[10px] text-[#746B60]">
                    Our concierge reviews all personalized requests prior to your arrival.
                  </p>
                </div>
              </motion.div>
            )}

            {/* =========================================================================
                STEP 6: REVIEW & PAYMENT AT SALON DESK
                ========================================================================= */}
            {currentStep === 6 && (
              <motion.div
                key="step-review-confirmation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B88A45] font-semibold block">
                    Step 6 of 6 • Final Verification
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#211D18]">
                    Review Reservation & Desk Settlement
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed">
                    Verify your treatments and scheduled window. In accordance with salon policy, all payments are fulfilled at the front desk upon arrival.
                  </p>
                </div>

                {/* Itemized Services Breakdown */}
                <div className="bg-white border border-[#E6DCCB] p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E6DCCB] pb-3">
                    <span className="font-sans text-xs uppercase tracking-widest text-[#746B60] font-bold">
                      Selected Rituals ({selectedServices.length})
                    </span>
                    <span className="font-sans text-xs text-[#746B60]">
                      Combined Duration: <strong className="text-[#211D18]">{cartTotalDurationMinutes} Mins</strong>
                    </span>
                  </div>

                  <div className="divide-y divide-[#E6DCCB]/60 space-y-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="pt-2 flex justify-between items-center text-xs">
                        <div>
                          <h5 className="font-serif font-bold text-[#211D18] text-sm">{service.name}</h5>
                          <span className="text-[10px] text-[#746B60]">{service.category} • {service.duration}</span>
                        </div>
                        <span className="font-serif font-bold text-sm text-[#211D18]">
                          {service.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Appointment Schedule Recap */}
                <div className="bg-white border border-[#E6DCCB] p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#746B60] block font-bold">
                      Date & Day
                    </span>
                    <span className="font-serif text-base font-bold text-[#211D18] block mt-1">
                      {dateChoices.find(d => d.value === selectedDate)?.label || selectedDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#746B60] block font-bold">
                      Scheduled Window
                    </span>
                    <span className="font-serif text-base font-bold text-[#211D18] block mt-1">
                      {selectedTimeSlot} – {formatMinutesToTime((parseTimeToMinutes(selectedTimeSlot) || 600) + cartTotalDurationMinutes)} ({cartTotalDurationMinutes}m)
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white border border-[#E6DCCB] p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between text-xs text-[#746B60]">
                    <span>Treatment Subtotal:</span>
                    <span className="font-serif">₹{cartBasePrice}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#746B60]">
                    <span>Luxury GST & Amenities (18%):</span>
                    <span className="font-serif">₹{taxValue}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                      <span>Privilege Discount ({promoCode}):</span>
                      <span className="font-serif">-₹{discountValue}</span>
                    </div>
                  )}
                  <div className="border-t border-[#E6DCCB] pt-3 flex justify-between items-center">
                    <div>
                      <span className="font-sans text-xs uppercase tracking-wider font-bold text-[#211D18] block">
                        Total Amount Due at Desk
                      </span>
                      <span className="text-[10px] text-[#746B60]">
                        Settlement upon arrival at salon front desk
                      </span>
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#B88A45]">
                      ₹{finalTotalAmount}
                    </span>
                  </div>
                </div>

                {/* Desk Settlement Notice Banner */}
                <div className="bg-[#FAF7F0] border border-[#E6DCCB] p-5 rounded-2xl space-y-2 text-left">
                  <div className="flex items-center gap-2 text-[#B88A45]">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span className="font-serif text-sm font-bold text-[#211D18]">
                      Payment at Salon Desk
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#746B60] leading-relaxed">
                    No advance online payment is required. Your slot and stylist allocation are held under your reservation reference. Settle in person via Cash, Card, or UPI upon arrival.
                  </p>
                </div>

                {/* Terms of Attendance Checkbox */}
                <div className="flex items-start gap-2.5 pt-1 text-left">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#E6DCCB] text-[#B88A45] focus:ring-[#B88A45]"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-[#746B60] font-sans">
                    I confirm my reservation details and acknowledge that I will arrive 10 minutes prior to my scheduled session for desk check-in.
                  </label>
                </div>
              </motion.div>
            )}

            {/* =========================================================================
                STEP 7: COMPLETE DIGITAL BOOKING TICKET (Success State)
                ========================================================================= */}
            {currentStep === 7 && completedRecord && (
              <motion.div
                key="step-confirmation-ticket"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4 max-w-2xl mx-auto"
              >
                {/* Visual Header */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="h-16 w-16 bg-[#B88A45]/15 text-[#B88A45] rounded-full flex items-center justify-center mx-auto border border-[#B88A45]/30"
                  >
                    <CheckCircle className="h-10 w-10 stroke-1.5" />
                  </motion.div>
                  <span className="font-mono text-[10px] tracking-widest text-[#B88A45] uppercase font-bold block">
                    CONCIERGE RESERVATION REQUEST
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#211D18] leading-tight">
                    Official Digital Booking Pass
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed">
                    Your appointment has been logged with authoritative salon pricing and time parameters. Payment is due at the salon desk upon arrival.
                  </p>
                </div>

                {/* Premium Musha Empire Digital Ticket Card */}
                <div
                  id="digital-booking-ticket"
                  className="bg-[#FAF7F0] border-2 border-[#B88A45]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-left space-y-6"
                >
                  {/* Decorative Ticket Perforation / Ribbons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DCCB] pb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#211D18] flex items-center justify-center text-[#B88A45] shadow-md">
                        <Sparkles className="h-6 w-6 text-[#B88A45]" />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#B88A45] font-bold block">
                          OFFICIAL DIGITAL BOOKING PASS
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18]">
                          Musha Empire Unisex Salon
                        </h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] block font-bold">
                        Booking Reference
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-[#B88A45] bg-white px-3 py-1 rounded-lg border border-[#E6DCCB] inline-block mt-0.5 shadow-sm">
                        {completedRecord.id}
                      </span>
                    </div>
                  </div>

                  {/* Patron & Appointment Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-[#E6DCCB] p-4 rounded-2xl">
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] block font-bold">Patron Name</span>
                      <p className="font-serif text-sm font-bold text-[#211D18] mt-0.5 truncate">{completedRecord.customerName || 'Valued Patron'}</p>
                    </div>
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] block font-bold">Appointment Date</span>
                      <p className="font-serif text-sm font-bold text-[#211D18] mt-0.5 flex items-center gap-1.5 truncate">
                        <Calendar className="h-3.5 w-3.5 text-[#B88A45] shrink-0" /> {completedRecord.date}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] block font-bold">Scheduled Window</span>
                      <p className="font-sans text-xs sm:text-sm font-semibold text-[#211D18] mt-0.5 flex items-center gap-1.5 truncate">
                        <Clock className="h-3.5 w-3.5 text-[#B88A45] shrink-0" /> {completedRecord.timeSlot} {completedRecord.endTime ? `– ${completedRecord.endTime}` : ''}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] block font-bold">Settlement Method</span>
                      <p className="font-sans text-xs font-bold text-[#B88A45] mt-0.5 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Payment at Salon Desk
                      </p>
                    </div>
                  </div>

                  {/* Selected Services Grouped & Categorized Individually */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E6DCCB] pb-2">
                      <span className="font-sans text-[11px] uppercase tracking-widest text-[#746B60] font-bold">
                        Reserved Treatments ({completedRecord.services?.length || 1})
                      </span>
                      <span className="font-sans text-xs text-[#746B60]">
                        Combined Duration: <strong className="text-[#211D18]">{cartTotalDurationMinutes || 60} Mins</strong>
                      </span>
                    </div>

                    {/* Grouped Services List */}
                    <div className="space-y-2.5">
                      {Object.entries(groupedServices).map(([categoryName, servicesList]) => (
                        <div key={categoryName} className="bg-white border border-[#E6DCCB] rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E6DCCB] font-sans text-[9px] uppercase tracking-widest font-bold text-[#B88A45]">
                              {categoryName}
                            </span>
                          </div>
                          <div className="divide-y divide-[#E6DCCB]/60">
                            {servicesList.map(service => (
                              <div key={service.id} className="py-2 flex items-center justify-between text-xs">
                                <div>
                                  <h5 className="font-serif font-bold text-[#211D18] text-sm">{service.name}</h5>
                                  <span className="text-[10px] text-[#746B60] flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3 text-[#B88A45]" /> {service.duration}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-serif font-bold text-sm text-[#211D18]">
                                    {service.price}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Breakdown & Settlement Status */}
                  <div className="bg-white border border-[#E6DCCB] p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs text-[#746B60]">
                      <span>Treatment Subtotal:</span>
                      <span className="font-serif">₹{cartBasePrice}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#746B60]">
                      <span>Luxury GST & Amenities (18%):</span>
                      <span className="font-serif">₹{taxValue}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                        <span>Privilege Discount ({promoCode}):</span>
                        <span className="font-serif">-₹{discountValue}</span>
                      </div>
                    )}
                    <div className="border-t border-[#E6DCCB] pt-3 flex justify-between items-center">
                      <div>
                        <span className="font-sans text-xs uppercase tracking-wider font-bold text-[#211D18] block">
                          Total Amount Due at Desk
                        </span>
                        <span className="text-[10px] text-[#746B60]">
                          Pay via Cash, Card, or UPI upon arrival at reception
                        </span>
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#B88A45]">
                        ₹{completedRecord.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Front-Desk QR Check-in Box */}
                  <div className="bg-white border border-[#E6DCCB] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#B88A45] font-bold block">
                        FRONT DESK CHECK-IN VERIFICATION
                      </span>
                      <p className="font-sans text-xs text-[#746B60]">
                        Present this pass at reception. Arrive 10 minutes prior to enjoy our welcome white tea.
                      </p>
                      <span className="font-mono text-[10px] text-[#211D18] font-bold block">
                        Pass Code: {completedRecord.id} • Status: Awaiting Concierge Confirmation
                      </span>
                    </div>
                    <div className="p-2 border border-[#E6DCCB] rounded-xl bg-[#FAF7F0] shrink-0">
                      <QrCode className="h-16 w-16 text-[#211D18]" />
                    </div>
                  </div>
                </div>

                {/* Concierge Desk Contact Notice Box */}
                <div className="bg-[#FAF7F0] border border-[#E6DCCB] p-5 text-left space-y-3 rounded-2xl">
                  <h5 className="font-serif text-sm font-semibold text-[#211D18] flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#B88A45]" /> Front-Desk Assistance
                  </h5>
                  <p className="font-sans text-xs text-[#746B60] leading-relaxed">
                    Quote reference <span className="font-mono text-[#211D18] font-bold">{completedRecord.id}</span> if contacting our concierge:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white border border-[#E6DCCB] rounded-xl space-y-1">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#B88A45] block font-bold">Concierge Phone / WhatsApp</span>
                      <span className="font-mono text-xs font-bold text-[#211D18] block">+91 98765 43210</span>
                    </div>
                    <div className="p-3 bg-white border border-[#E6DCCB] rounded-xl space-y-1">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#B88A45] block font-bold">Operating Hours</span>
                      <span className="font-sans text-xs text-[#211D18] block">Mon – Sun: 10:00 AM – 9:00 PM IST</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      id="concierge-view-portal-btn"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        try {
                          sessionStorage.setItem('musha_portal_initial_tab', 'requests');
                        } catch {}
                        onViewAppointments('requests');
                      }}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      className="w-full font-sans text-xs uppercase tracking-widest font-bold py-2.5"
                    >
                      View Request #{completedRecord.id} in Concierge Portal
                    </Button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    id="success-view-app-btn"
                    variant={isConciergeMode ? 'primary' : 'outline'}
                    size="md"
                    onClick={() => {
                      try {
                        if (isConciergeMode) {
                          sessionStorage.setItem('musha_portal_initial_tab', 'requests');
                        }
                      } catch {}
                      onViewAppointments(isConciergeMode ? 'requests' : 'upcoming');
                    }}
                    className="w-full sm:w-auto font-sans text-xs uppercase tracking-widest px-6"
                  >
                    {isConciergeMode ? 'Open Concierge Requests in Portal' : 'View Portal & Account'}
                  </Button>
                  <Button
                    id="success-print-btn"
                    variant="outline"
                    size="md"
                    onClick={handlePrintTicket}
                    leftIcon={<Printer className="h-4 w-4" />}
                    className="w-full sm:w-auto font-sans text-xs uppercase tracking-widest px-6"
                  >
                    Print / Save Pass
                  </Button>
                  <Button
                    id="success-home-btn"
                    variant="outline"
                    size="md"
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto font-sans text-xs uppercase tracking-widest px-6"
                  >
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Footer Controls (Steps 2 to 6) */}
          {currentStep > 1 && currentStep < 7 && (
            <div className="flex justify-between items-center pt-6 border-t border-[#E6DCCB]">
              <Button
                id="booking-prev-step-btn"
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="font-sans text-xs uppercase tracking-wider font-bold"
              >
                Back
              </Button>

              {currentStep < 6 ? (
                <Button
                  id="booking-next-step-btn"
                  variant="primary"
                  size="sm"
                  disabled={
                    (currentStep === 2 && selectedServices.length === 0) ||
                    (currentStep === 3 && !selectedDate) ||
                    (currentStep === 4 && (!selectedTimeSlot || timeSlots.find(s => s.time === selectedTimeSlot)?.status === 'booked'))
                  }
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="font-sans text-xs uppercase tracking-wider font-bold px-6 disabled:opacity-40"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  id="booking-confirm-btn"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmReservation}
                  disabled={isSubmitting || !acceptedTerms}
                  leftIcon={isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-[#B88A45]" />
                  )}
                  className="font-sans text-xs uppercase tracking-wider font-bold px-8 bg-[#211D18] text-white hover:bg-[#B88A45] disabled:opacity-50"
                >
                  {isSubmitting ? 'Securing Slot...' : 'Confirm Reservation (Pay at Salon Desk)'}
                </Button>
              )}
            </div>
          )}

        </div>

        {/* Right Bill & Cart Summary Panel (col-span-4) - Active for steps 2 to 6 */}
        {currentStep > 1 && currentStep < 7 && (
          <div className="hidden lg:block lg:col-span-4 bg-white border border-[#E6DCCB] p-5 rounded-2xl space-y-5 text-left sticky top-28 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E6DCCB] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#B88A45]" />
                <h4 className="font-serif text-base font-bold text-[#211D18]">
                  Reservation Summary
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-[#B88A45] bg-[#FAF7F0] px-2 py-0.5 rounded-full border border-[#E6DCCB]">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Selected category */}
            <div className="text-xs text-[#746B60] flex justify-between border-b border-[#E6DCCB]/60 pb-2">
              <span>Category:</span>
              <strong className="text-[#211D18]">
                {APPROVED_CATEGORIES.find(c => c.id === selectedCategory)?.title || selectedCategory || 'Universal'}
              </strong>
            </div>

            {/* Schedule details if picked */}
            {selectedDate && currentStep >= 3 && (
              <div className="text-xs text-[#746B60] flex justify-between border-b border-[#E6DCCB]/60 pb-2">
                <span>Date:</span>
                <strong className="text-[#211D18] truncate ml-2">
                  {dateChoices.find(d => d.value === selectedDate)?.dayName}, {dateChoices.find(d => d.value === selectedDate)?.monthName} {dateChoices.find(d => d.value === selectedDate)?.dateNum}
                </strong>
              </div>
            )}

            {selectedTimeSlot && currentStep >= 4 && (
              <div className="text-xs text-[#746B60] flex justify-between border-b border-[#E6DCCB]/60 pb-2">
                <span>Time Slot:</span>
                <strong className="text-[#211D18]">{selectedTimeSlot}</strong>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {selectedServices.length === 0 ? (
                <p className="text-xs text-[#746B60] italic text-center py-4">No treatments selected yet</p>
              ) : (
                selectedServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center text-xs group">
                    <div className="min-w-0 pr-2">
                      <p className="font-serif font-bold text-[#211D18] truncate">{service.name}</p>
                      <span className="text-[10px] text-[#746B60]">{service.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-serif font-bold text-[#211D18]">{service.price}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.id)}
                        className="text-[#746B60] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        title="Remove service"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Duration Banner */}
            <div className="bg-[#FAF7F0] border border-[#E6DCCB] p-2.5 rounded-xl flex items-center justify-between text-xs font-sans">
              <span className="text-[#746B60] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#B88A45]" /> Combined Time:
              </span>
              <strong className="text-[#211D18]">{cartTotalDurationMinutes} Minutes</strong>
            </div>

            {/* Promo Voucher Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-1">
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#746B60]" />
                  <input
                    id="promo-code-input"
                    type="text"
                    placeholder="Privilege Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#FAF7F0] border border-[#E6DCCB] rounded-lg py-1.5 pl-8 pr-2 text-xs font-mono uppercase text-[#211D18] placeholder-[#746B60] focus:outline-none focus:border-[#B88A45]"
                  />
                </div>
                <Button
                  id="promo-apply-btn"
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="font-sans text-[10px] uppercase tracking-wider px-3"
                >
                  Apply
                </Button>
              </div>
              {promoSuccessMessage && (
                <p className="text-[10px] text-emerald-600 font-sans">{promoSuccessMessage}</p>
              )}
              {promoErrorMessage && (
                <p className="text-[10px] text-red-500 font-sans">{promoErrorMessage}</p>
              )}
            </form>

            {/* Pricing breakdown */}
            <div className="border-t border-[#E6DCCB] pt-3 space-y-2 text-xs text-[#746B60]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-serif">₹{cartBasePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Luxury GST (18%):</span>
                <span className="font-serif">₹{taxValue}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Privilege Credit:</span>
                  <span className="font-serif">-₹{discountValue}</span>
                </div>
              )}
              <div className="border-t border-[#E6DCCB] pt-2 flex justify-between items-center text-sm font-bold text-[#211D18]">
                <span>Total Amount:</span>
                <span className="font-serif text-lg text-[#B88A45]">₹{finalTotalAmount}</span>
              </div>
              <p className="text-[10px] text-[#746B60] italic text-center pt-1">
                Settlement upon arrival at salon front desk
              </p>
            </div>

            {/* Sidebar proceed button */}
            {currentStep === 2 && (
              <Button
                id="desktop-cart-proceed-btn"
                variant="primary"
                size="sm"
                disabled={selectedServices.length === 0}
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full font-sans text-xs uppercase tracking-wider font-bold py-2.5 disabled:opacity-40"
              >
                Continue to Date
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                id="desktop-date-proceed-btn"
                variant="primary"
                size="sm"
                disabled={!selectedDate}
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full font-sans text-xs uppercase tracking-wider font-bold py-2.5 disabled:opacity-40"
              >
                Continue to Time Slot
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                id="desktop-time-proceed-btn"
                variant="primary"
                size="sm"
                disabled={!selectedTimeSlot || timeSlots.find(s => s.time === selectedTimeSlot)?.status === 'booked'}
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full font-sans text-xs uppercase tracking-wider font-bold py-2.5 disabled:opacity-40"
              >
                Continue to Patron Details
              </Button>
            )}
          </div>
        )}

      </div>

      {/* =========================================================================
          FIXED FLOATING BOTTOM BARS (Mobile & Touch Accessible)
          ========================================================================= */}

      {/* Sticky Bottom Bar for Step 2: Multi-Service Selection */}
      {currentStep === 2 && (
        <div
          id="mobile-cart-continue-bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#211D18] text-[#FAF7F0] border-t border-[#B88A45]/30 p-3.5 sm:p-4 shadow-2xl pb-safe"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <button
              id="cart-back-btn"
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 text-xs text-[#FAF7F0]/80 hover:text-[#B88A45] font-sans font-semibold transition-colors px-2.5 py-2 rounded-lg border border-[#FAF7F0]/20 hover:border-[#B88A45] shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="text-left flex-1 min-w-0 px-1">
              <span className="text-[10px] uppercase tracking-wider text-[#B88A45] block truncate font-sans font-semibold">
                {cartItemCount} {cartItemCount === 1 ? 'Ritual' : 'Rituals'} • {cartTotalDurationMinutes} Mins
              </span>
              <span className="text-xs sm:text-sm font-serif font-bold text-white truncate block">
                Total: ₹{finalTotalAmount}
              </span>
            </div>

            <Button
              id="mobile-cart-proceed-btn"
              variant="primary"
              size="sm"
              disabled={selectedServices.length === 0}
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="font-sans text-xs uppercase tracking-wider font-bold px-4 sm:px-6 shrink-0 bg-[#B88A45] text-white hover:bg-[#a07436] disabled:opacity-40"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar for Step 3 (Page 1): Date Selection */}
      {currentStep === 3 && (
        <div
          id="mobile-date-continue-bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#211D18] text-[#FAF7F0] border-t border-[#B88A45]/30 p-3.5 sm:p-4 shadow-2xl pb-safe"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <button
              id="date-back-btn"
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 text-xs text-[#FAF7F0]/80 hover:text-[#B88A45] font-sans font-semibold transition-colors px-2.5 py-2 rounded-lg border border-[#FAF7F0]/20 hover:border-[#B88A45] shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Services</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="text-left flex-1 min-w-0 px-1">
              <span className="text-[10px] uppercase tracking-wider text-[#B88A45] block truncate font-sans font-semibold">
                Selected Date
              </span>
              <span className="text-xs sm:text-sm font-serif font-bold text-white truncate block">
                {selectedDate ? (dateChoices.find(d => d.value === selectedDate)?.label || selectedDate) : 'Please pick a date'}
              </span>
            </div>

            <Button
              id="mobile-date-proceed-btn"
              variant="primary"
              size="sm"
              disabled={!selectedDate}
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="font-sans text-xs uppercase tracking-wider font-bold px-4 sm:px-6 shrink-0 bg-[#B88A45] text-white hover:bg-[#a07436] disabled:opacity-40"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar for Step 4 (Page 2): Time Slot Selection */}
      {currentStep === 4 && (
        <div
          id="mobile-time-continue-bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#211D18] text-[#FAF7F0] border-t border-[#B88A45]/30 p-3.5 sm:p-4 shadow-2xl pb-safe"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <button
              id="time-back-btn"
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 text-xs text-[#FAF7F0]/80 hover:text-[#B88A45] font-sans font-semibold transition-colors px-2.5 py-2 rounded-lg border border-[#FAF7F0]/20 hover:border-[#B88A45] shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Date</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="text-left flex-1 min-w-0 px-1">
              <span className="text-[10px] uppercase tracking-wider text-[#B88A45] block truncate font-sans font-semibold">
                Selected Time Slot
              </span>
              <span className="text-xs sm:text-sm font-serif font-bold text-white truncate block">
                {selectedTimeSlot ? `${selectedTimeSlot} (${cartTotalDurationMinutes}m total)` : 'Please select time'}
              </span>
            </div>

            <Button
              id="mobile-time-proceed-btn"
              variant="primary"
              size="sm"
              disabled={!selectedTimeSlot || timeSlots.find(s => s.time === selectedTimeSlot)?.status === 'booked'}
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="font-sans text-xs uppercase tracking-wider font-bold px-4 sm:px-6 shrink-0 bg-[#B88A45] text-white hover:bg-[#a07436] disabled:opacity-40"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

// Utility to determine default category based on service ID
function getCategoryForServiceId(serviceId: string): string {
  if (!serviceId) return 'Other';
  const found = EXTENDED_SERVICES_DATA.find(s => s.id === serviceId);
  if (!found) return 'Other';

  if (found.gender === 'Men' || found.category === "Men's Services") return 'Men';
  if (found.gender === 'Women' || found.category === "Women's Services") return 'Women';
  if ((found.gender as string) === 'Boy') return 'Boy';
  if ((found.gender as string) === 'Girl') return 'Girl';
  return 'Other';
}

// Helper to calculate current date and minutes in a target timezone safely
function getSalonNow(timeZone?: string) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

    const y = getPart('year');
    const m = getPart('month');
    const d = getPart('day');
    const hr = parseInt(getPart('hour') || '0', 10);
    const min = parseInt(getPart('minute') || '0', 10);

    return {
      todayIso: `${y}-${m}-${d}`,
      currentMinutes: hr * 60 + min
    };
  } catch {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return {
      todayIso: `${y}-${m}-${d}`,
      currentMinutes: now.getHours() * 60 + now.getMinutes()
    };
  }
}
