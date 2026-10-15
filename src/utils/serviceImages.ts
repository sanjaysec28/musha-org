/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Salon — Curated Service Photography Resolver
 * High-definition, authentic salon and spa imagery categorized by specific treatments.
 */

import { ExtendedService } from '../data/servicesExtendedData';

export function getServiceEditorialImage(service: ExtendedService): string {
  const name = service.name.toLowerCase();
  const cat = service.category.toLowerCase();
  const id = service.id.toLowerCase();
  const gender = service.gender;

  // 1. Bridal & Pre-Wedding Luxury Suites
  if (
    cat.includes('bridal') ||
    cat.includes('makeup') ||
    name.includes('bridal') ||
    name.includes('wedding') ||
    id.includes('bridal')
  ) {
    if (name.includes('groom') || id.includes('groom')) {
      return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
  }

  // 2. Hair Colour, Balayage, Highlights & Streaks
  if (
    cat.includes('colour') ||
    cat.includes('color') ||
    name.includes('colour') ||
    name.includes('color') ||
    name.includes('balayage') ||
    name.includes('highlight') ||
    name.includes('touch-up') ||
    name.includes('streak')
  ) {
    if (name.includes('balayage') || name.includes('global') || name.includes('blonde')) {
      return 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('foil') || name.includes('streak') || name.includes('fashion')) {
      return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';
  }

  // 3. Hair Spa, Scalp Treatments & Deep Conditioning
  if (
    cat.includes('treatment') ||
    name.includes('spa') ||
    name.includes('scalp') ||
    name.includes('massage') ||
    name.includes('keratin') ||
    name.includes('botox') ||
    name.includes('nanoplastia')
  ) {
    if (name.includes('spa') || name.includes('scalp') || name.includes('rinse')) {
      return 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('botox') || name.includes('nanoplastia') || name.includes('keratin') || name.includes('straightening')) {
      return 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
  }

  // 4. Beard Grooming & Men's Combos
  if (
    name.includes('beard') ||
    name.includes('shave') ||
    name.includes('moustache') ||
    id.includes('beard')
  ) {
    if (name.includes('combo') || name.includes('haircut')) {
      return 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80';
  }

  // 5. Skin & Facials (Hydra, O3+, Gold, De-Tan, Cleanup)
  if (
    cat.includes('skin') ||
    cat.includes('facial') ||
    name.includes('facial') ||
    name.includes('cleanup') ||
    name.includes('tan') ||
    name.includes('glow')
  ) {
    if (name.includes('hydra') || name.includes('korean') || name.includes('o3') || name.includes('gold')) {
      return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('tan') || name.includes('cleanup') || name.includes('bleach')) {
      return 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80';
  }

  // 6. Waxing & Threading
  if (
    cat.includes('wax') ||
    name.includes('wax') ||
    cat.includes('threading') ||
    name.includes('threading') ||
    name.includes('eyebrow')
  ) {
    if (cat.includes('threading') || name.includes('eyebrow') || name.includes('forehead') || name.includes('chin') || name.includes('upper lip')) {
      return 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80';
  }

  // 7. Manicure & Pedicure (Hands & Feet)
  if (
    cat.includes('hands') ||
    cat.includes('feet') ||
    name.includes('manicure') ||
    name.includes('pedicure') ||
    name.includes('nail')
  ) {
    if (name.includes('pedicure')) {
      return 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80';
    }
    if (name.includes('nail') || name.includes('paint') || name.includes('art')) {
      return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80';
  }

  // 8. Haircuts & Styling
  if (gender === 'Men') {
    if (name.includes('fade') || name.includes('undercut') || name.includes('trim')) {
      return 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80';
  }

  if (gender === 'Kids') {
    return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80';
  }

  // Women's haircuts and blowdry styling
  if (name.includes('blowdry') || name.includes('styling') || name.includes('iron') || name.includes('curls') || name.includes('wash')) {
    return 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80';
  }

  if (name.includes('layer') || name.includes('haircut') || name.includes('bob') || name.includes('trim')) {
    return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80';
  }

  // Default high-grade salon visual
  return service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
}
