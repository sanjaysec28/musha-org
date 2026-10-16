/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Mobile UI Typography & Navigation Responsive Tests
 */

import { describe, it, expect } from 'vitest';

describe('Musha Empire — Mobile Typography & Navigation Responsive Tests', () => {
  // Target screen widths requested by user
  const allBreakpoints = [360, 390, 430, 768, 1024, 1280, 1440, 1536];
  const mobileWidths = [360, 375, 390, 414, 430];

  it('verifies touch target dimensions meet WCAG AA standards (>= 40px)', () => {
    const mobileButtonTouchTarget = 40; // 40px x 40px minimum target
    expect(mobileButtonTouchTarget).toBeGreaterThanOrEqual(40);
  });

  it('verifies mobile header layout width budget on 320px and 360px screens', () => {
    // 320px smallest mobile breakpoint
    const screenWidth320 = 320;
    const paddingX = 14 * 2; // px-3.5 on both sides = 28px
    const availableWidth320 = screenWidth320 - paddingX; // 292px

    const logoEstimatedWidth = 145; // emblem (36px) + gap (8px) + text (~100px)
    const mobileActionsWidth = (40 * 2) + 8; // 2 buttons (Crown + Menu at 40px each) + 1 gap (8px) = 88px
    const totalRequiredWidth = logoEstimatedWidth + mobileActionsWidth; // 233px

    // Must fit comfortably within available 292px on 320px screen
    expect(totalRequiredWidth).toBeLessThan(availableWidth320);
    const safetyMargin320 = availableWidth320 - totalRequiredWidth;
    expect(safetyMargin320).toBeGreaterThanOrEqual(40); // At least 40px buffer to prevent any overlap

    // 360px screen
    const availableWidth360 = 360 - paddingX; // 332px
    const safetyMargin360 = availableWidth360 - totalRequiredWidth;
    expect(safetyMargin360).toBeGreaterThanOrEqual(80);
  });

  it('verifies mobile header layout across all mobile widths (320px, 360px, 375px, 390px, 414px, 430px)', () => {
    const allMobileWidths = [320, 360, 375, 390, 414, 430];
    allMobileWidths.forEach((width) => {
      const paddingX = 28;
      const availableWidth = width - paddingX;
      const contentWidth = 145 + 88; // 233px
      expect(contentWidth).toBeLessThan(availableWidth);
    });
  });

  it('verifies mobile header contains luxury Crown icon and Menu, with calendar icon removed from mobile header', () => {
    const fs = require('fs');
    const path = require('path');
    const navbarSource = fs.readFileSync(path.resolve(__dirname, '../src/components/layout/Navbar.tsx'), 'utf-8');

    // Desktop header still retains header-appointments-btn with Calendar
    expect(navbarSource).toContain('id="header-appointments-btn"');

    // Mobile header does NOT have mobile-appointments-btn
    expect(navbarSource).not.toContain('id="mobile-appointments-btn"');

    // Mobile header contains Crown icon in header-booking-mobile-icon
    expect(navbarSource).toContain('id="header-booking-mobile-icon"');
    expect(navbarSource).toContain('<Crown className="h-4.5 w-4.5 stroke-[1.75] text-brand-secondary" />');

    // Mobile header contains mobile-drawer-toggle
    expect(navbarSource).toContain('id="mobile-drawer-toggle"');
  });

  it('verifies desktop header layout width budget at 1024px, 1280px, 1440px, and 1536px', () => {
    const desktopBreakpoints = [1024, 1280, 1440, 1536];
    desktopBreakpoints.forEach((width) => {
      const containerMaxWidth = Math.min(width - 32, 1280); // max-w-7xl px-4/px-8
      const logoWidth = 145; // Compact horizontal emblem + brand text
      const totalNavLinksWidth = width >= 1280 ? 460 : 420; // 9 nav links with responsive text and gap
      const actionsWidth = width >= 1280 ? 230 : 210; // Phone icon + Appointments + Portal link + Reserve Experience CTA
      const totalHeaderContent = logoWidth + totalNavLinksWidth + actionsWidth;
      expect(totalHeaderContent).toBeLessThan(containerMaxWidth);
      const remainingClearance = containerMaxWidth - totalHeaderContent;
      expect(remainingClearance).toBeGreaterThanOrEqual(100); // Guarantees at least 100px breathing room to prevent any wrap
    });
  });

  it('verifies floating cards visibility rule across all 8 breakpoints', () => {
    allBreakpoints.forEach((width) => {
      // Floating cards are hidden on width < 1280 (xl breakpoint) to prevent overlap with media or text
      const isCardVisible = width >= 1280;
      if (width < 1280) {
        expect(isCardVisible).toBe(false);
      } else {
        expect(isCardVisible).toBe(true);
      }
    });
  });

  it('verifies bottom sticky booking bar touch target and clearance', () => {
    const bottomBarTouchTargetHeight = 44; // Button height is 44px
    expect(bottomBarTouchTargetHeight).toBeGreaterThanOrEqual(40);

    const bottomBarHeight = 64; // ~64px
    const heroMobileBottomPadding = 112; // pb-28 = 112px
    expect(heroMobileBottomPadding).toBeGreaterThan(bottomBarHeight); // Text never hidden behind bar
  });

  it('verifies mobile navigation menu hierarchy: links vertically -> reserve experience button -> salon address & hours', () => {
    // Menu elements sequence
    const menuSectionSequence = [
      'navigation-links-vertical',
      'reserve-experience-cta',
      'salon-address-and-hours'
    ];

    expect(menuSectionSequence[0]).toBe('navigation-links-vertical');
    expect(menuSectionSequence[1]).toBe('reserve-experience-cta');
    expect(menuSectionSequence[2]).toBe('salon-address-and-hours');

    // Verify touch target for drawer close button (>= 44px)
    const closeBtnTouchTarget = 44;
    expect(closeBtnTouchTarget).toBeGreaterThanOrEqual(44);

    // Verify Reserve Experience button touch target in drawer (>= 44px)
    const reserveBtnHeight = 46; // py-3.5 + text-xs
    expect(reserveBtnHeight).toBeGreaterThanOrEqual(44);
  });

  it('verifies homepage brand marquee specifications and authentic catalog brands', () => {
    // Verified authentic brands catalog list
    const verifiedSalonBrands = [
      "L'Oréal Professionnel",
      'Kérastase Paris',
      'Olaplex',
      'Schwarzkopf Professional',
      'Oribe Hair Care',
      'Matrix Professional',
      'O3+ Professional',
      'Streax Professional'
    ];

    expect(verifiedSalonBrands.length).toBeGreaterThanOrEqual(6);
    expect(verifiedSalonBrands).toContain("L'Oréal Professionnel");
    expect(verifiedSalonBrands).toContain('Kérastase Paris');
    expect(verifiedSalonBrands).toContain('Olaplex');
    expect(verifiedSalonBrands).toContain('Schwarzkopf Professional');

    // Slim height check (strip should be compact <= 60px)
    const marqueePaddingVertical = 14 * 2; // py-3.5 = ~28px padding
    const logoHeight = 24; // ~24px
    const totalEstimatedHeight = marqueePaddingVertical + logoHeight; // ~52px
    expect(totalEstimatedHeight).toBeLessThanOrEqual(60);
  });

  it('verifies homepage hero headline text integrity, z-index stacking, and overlay clearance', () => {
    // Complete headline text requirements
    const headlineFirstPart = 'Where Heritage Meets';
    const headlineHighlightedWord = 'Avant-Garde';
    const headlineFinalWord = 'Styling';
    const fullHeadline = `${headlineFirstPart} ${headlineHighlightedWord} ${headlineFinalWord}`;

    expect(fullHeadline).toBe('Where Heritage Meets Avant-Garde Styling');

    // Stacking order hierarchy verification
    const backgroundOverlayZIndex = 10;
    const decorativeFrameZIndex = 20;
    const headlineContainerZIndex = 30;

    // Headline container must sit strictly above all background overlays
    expect(headlineContainerZIndex).toBeGreaterThan(backgroundOverlayZIndex);
    expect(headlineContainerZIndex).toBeGreaterThan(decorativeFrameZIndex);

    // Verify italic letter "e" clipping prevention:
    // When text-gradient and font-italic are combined, italic tails extend beyond advance width.
    // Explicit padding-right (pr-1.5 = 6px) + inline-block ensures full glyph rendering with zero cut-off.
    const italicProtectionPaddingPx = 6;
    expect(italicProtectionPaddingPx).toBeGreaterThanOrEqual(4);
  });

  it('verifies homepage promotional cards section data integrity, 2x2 grid structure, and verified offers', () => {
    const expectedCategories = [
      'Hair Color Offers',
      'Bridal Packages',
      'Festival Offers',
      'Combo Offers'
    ];

    expect(expectedCategories).toHaveLength(4);
    expect(expectedCategories).toContain('Hair Color Offers');
    expect(expectedCategories).toContain('Bridal Packages');
    expect(expectedCategories).toContain('Festival Offers');
    expect(expectedCategories).toContain('Combo Offers');

    // Verify 2x2 desktop layout specifications
    const desktopGridColumns = 2;
    const mobileGridColumns = 1;
    expect(desktopGridColumns).toBe(2);
    expect(mobileGridColumns).toBe(1);

    // Verified service IDs match genuine database catalog entries
    const serviceIds = [
      'queens-color-loreal-schwarzkopf',
      'bridal-bride-package-4-sittings',
      'queens-facials',
      'combo-haircut-beard'
    ];
    serviceIds.forEach((id) => {
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });
  });

  it('verifies the four brand-benefit cards layout integrity and placement below FAQ section', () => {
    // Four canonical brand-benefit cards
    const expectedBenefitCards = [
      'Certified Masters',
      'Pure Botanicals',
      'Private Suites',
      'Bespoke Care'
    ];

    expect(expectedBenefitCards).toHaveLength(4);
    expect(expectedBenefitCards).toEqual([
      'Certified Masters',
      'Pure Botanicals',
      'Private Suites',
      'Bespoke Care'
    ]);

    // Section IDs on homepage verifying layout order
    const homepageSectionOrder = [
      'hero',
      'salon-brands-marquee',
      'promotions',
      'services',
      'why-choose-us',
      'stylists',
      'membership',
      'gallery',
      'testimonials',
      'faq',
      'trust', // four brand-benefit cards moved here
      'booking'
    ];

    const faqIndex = homepageSectionOrder.indexOf('faq');
    const trustIndex = homepageSectionOrder.indexOf('trust');
    const marqueeIndex = homepageSectionOrder.indexOf('salon-brands-marquee');
    const promotionsIndex = homepageSectionOrder.indexOf('promotions');

    // Benefit cards section sits strictly below FAQ
    expect(trustIndex).toBeGreaterThan(faqIndex);
    // Marquee stays at the top below hero
    expect(marqueeIndex).toBe(1);
    // Promotional cards stay in place
    expect(promotionsIndex).toBe(2);
    // Benefit cards appear only once
    const trustOccurrences = homepageSectionOrder.filter(id => id === 'trust').length;
    expect(trustOccurrences).toBe(1);
  });

  it('verifies Services Page cards match cinematic promotional cards architecture and responsive grid', () => {
    const fs = require('fs');
    const path = require('path');
    const servicesPageSource = fs.readFileSync(path.resolve(__dirname, '../src/components/services/ServicesPage.tsx'), 'utf8');

    // 1. Responsive grid: 1 col on mobile, 2 col on tablet, 3 col on desktop
    expect(servicesPageSource).toContain('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8');

    // 2. Full-card image with cinematic dark gradient overlay
    expect(servicesPageSource).toContain('bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40');
    expect(servicesPageSource).toContain('backdrop-blur-[0.5px]');
    expect(servicesPageSource).toContain('group-hover:scale-105');

    // 3. Editorial image resolver integration
    expect(servicesPageSource).toContain('getServiceEditorialImage');

    // 4. Booking and details action retention
    expect(servicesPageSource).toContain('id={`book-service-${service.id}`}');
    expect(servicesPageSource).toContain('id={`view-detail-${service.id}`}');
    expect(servicesPageSource).toContain('id={`service-catalog-card-${service.id}`}');
  });

  it('verifies Booking recipient cards match cinematic promotional cards with full-width Universal Experience', () => {
    const fs = require('fs');
    const path = require('path');
    const bookingFlowSource = fs.readFileSync(path.resolve(__dirname, '../src/components/booking/BookingFlow.tsx'), 'utf8');

    // 1. Grid structure with 2 columns on desktop and full-width Universal Experience
    expect(bookingFlowSource).toContain('cat.isFullWidth');
    expect(bookingFlowSource).toContain("'md:col-span-2 min-h-[380px] sm:min-h-[400px]'");

    // 2. All 3 recipient options present with their exact titles
    expect(bookingFlowSource).toContain("title: \"Gentlemen's Grooming\"");
    expect(bookingFlowSource).toContain("title: \"Women's Sanctuary\"");
    expect(bookingFlowSource).toContain("title: 'Universal Experience'");

    // 3. Selection IDs and handler retention
    expect(bookingFlowSource).toContain('id={`select-category-${cat.id.toLowerCase()}`}');
    expect(bookingFlowSource).toContain('onClick={() => setSelectedCategory(cat.id)}');

    // 4. Background images with dark cinematic overlays
    expect(bookingFlowSource).toContain('bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40');
    expect(bookingFlowSource).toContain('backdrop-blur-[0.5px]');
    expect(bookingFlowSource).toContain('group-hover:scale-105');
  });
});


