/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Permanent Bright Creamy Luxury Theme Tests
 * Verifies that the customer website is permanently in Bright Creamy Luxury theme.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Musha Empire — Permanent Bright Creamy Luxury Theme System', () => {
  const cssSource = fs.readFileSync(path.resolve(__dirname, '../src/index.css'), 'utf-8');
  const themeContextSource = fs.readFileSync(path.resolve(__dirname, '../src/contexts/ThemeContext.tsx'), 'utf-8');
  const indexHtmlSource = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
  const navbarSource = fs.readFileSync(path.resolve(__dirname, '../src/components/layout/Navbar.tsx'), 'utf-8');
  const patronCategoriesSource = fs.readFileSync(path.resolve(__dirname, '../src/components/home/PatronCategories.tsx'), 'utf-8');
  const searchModalSource = fs.readFileSync(path.resolve(__dirname, '../src/components/ui/GlobalSearchModal.tsx'), 'utf-8');
  const bookingSource = fs.readFileSync(path.resolve(__dirname, '../src/components/booking/BookingFlow.tsx'), 'utf-8');

  it('verifies approved Bright Creamy Luxury centralized design tokens in index.css', () => {
    // 1. Main background: Warm Ivory #FAF7F0
    expect(cssSource).toContain('--brand-bg: #FAF7F0');

    // 2. Secondary section background: Soft Cream #F1E9DC
    expect(cssSource).toContain('--brand-surface-muted: #F1E9DC');

    // 3. Cards and elevated surfaces: Pure White #FFFFFF
    expect(cssSource).toContain('--brand-surface: #FFFFFF');

    // 4. Primary text: Deep Charcoal #211D18
    expect(cssSource).toContain('--brand-primary: #211D18');
    expect(cssSource).toContain('--brand-text: #211D18');

    // 5. Secondary text: Warm Taupe #746B60
    expect(cssSource).toContain('--brand-text-muted: #746B60');

    // 6. Primary accent: Champagne Gold #B88A45
    expect(cssSource).toContain('--brand-secondary: #B88A45');

    // 7. Secondary accent: Soft Gold #D8B77A
    expect(cssSource).toContain('--brand-gold-soft: #D8B77A');

    // 8. Borders and dividers: Warm Beige #E6DCCB
    expect(cssSource).toContain('--brand-border: #E6DCCB');
    expect(cssSource).toContain('--brand-accent: #E6DCCB');

    // 9. Muted surfaces: #F6F0E6
    expect(cssSource).toContain('--brand-surface-alt: #F6F0E6');
  });

  it('verifies Bright Creamy Luxury theme is permanently enabled in ThemeContext', () => {
    // Permanent light theme
    expect(themeContextSource).toContain("const theme: ThemeMode = 'light'");
    expect(themeContextSource).toContain('isLight: true');
    expect(themeContextSource).toContain('isDark: false');
    expect(themeContextSource).toContain("root.setAttribute('data-theme', 'light')");
    expect(themeContextSource).toContain("root.classList.remove('dark')");
    expect(themeContextSource).toContain("localStorage.removeItem('musha_theme_mode')");
  });

  it('verifies index.html has early theme flash prevention script permanently setting data-theme to light', () => {
    expect(indexHtmlSource).toContain("localStorage.removeItem('musha_theme_mode')");
    expect(indexHtmlSource).toContain("document.documentElement.setAttribute('data-theme', 'light')");
    expect(indexHtmlSource).toContain("document.documentElement.classList.remove('dark')");
    expect(indexHtmlSource).toContain("document.documentElement.classList.add('light')");
  });

  it('verifies ThemeToggle component is safely disabled/null in customer interface', () => {
    const toggleSource = fs.readFileSync(path.resolve(__dirname, '../src/components/ui/ThemeToggle.tsx'), 'utf-8');
    expect(toggleSource).toContain('return null');
  });

  it('verifies PatronCategories component features Men, Women, Boys, Girls, and Universal / Third Gender', () => {
    expect(patronCategoriesSource).toContain("id: 'Men'");
    expect(patronCategoriesSource).toContain("id: 'Women'");
    expect(patronCategoriesSource).toContain("id: 'Boy'");
    expect(patronCategoriesSource).toContain("id: 'Girl'");
    expect(patronCategoriesSource).toContain("id: 'Other'");
    expect(patronCategoriesSource).toContain("Third Gender");
  });

  it('verifies Brand benefit cards have been completely removed from TrustIndicators.tsx', () => {
    const trustSource = fs.readFileSync(path.resolve(__dirname, '../src/components/home/TrustIndicators.tsx'), 'utf-8');
    expect(trustSource).not.toContain('Certified Masters');
    expect(trustSource).not.toContain('Pure Botanicals');
    expect(trustSource).not.toContain('Private Suites');
    expect(trustSource).not.toContain('Bespoke Care');
  });

  it('verifies Royal Dispatch newsletter section uses soft cream background, charcoal heading, white input, and gold Subscribe button', () => {
    const newsletterSource = fs.readFileSync(path.resolve(__dirname, '../src/components/ui/NewsletterSection.tsx'), 'utf-8');
    expect(newsletterSource).toContain('bg-[#F1E9DC]');
    expect(newsletterSource).toContain('text-[#211D18]');
    expect(newsletterSource).toContain('text-[#746B60]');
    expect(newsletterSource).toContain('bg-white');
    expect(newsletterSource).toContain('border-[#E6DCCB]');
    expect(newsletterSource).toContain('Subscribe');
    expect(newsletterSource).toContain('id="newsletter-section-submit"');
  });

  it('verifies Mobile sticky booking bar is theme-aware, elevated, and properly spaced', () => {
    const stickySource = fs.readFileSync(path.resolve(__dirname, '../src/components/ui/StickyBookMobile.tsx'), 'utf-8');
    expect(stickySource).toContain('border-[#E6DCCB]');
    expect(stickySource).toContain('z-40');
    expect(stickySource).toContain('Book Experience');
    expect(stickySource).toContain('id="sticky-mobile-book-btn"');
    expect(stickySource).toContain('Musha Empire');
  });

  it('verifies Homepage promotional cards feature photography banner with controlled overlay and clean white information panel', () => {
    const promoSource = fs.readFileSync(path.resolve(__dirname, '../src/components/home/PromotionalOffers.tsx'), 'utf-8');
    expect(promoSource).toContain('Hair Color Artistry');
    expect(promoSource).toContain('Imperial Bridal Packages');
    expect(promoSource).toContain('bg-white');
    expect(promoSource).toContain('text-[#211D18]');
    expect(promoSource).toContain('text-[#746B60]');
    expect(promoSource).toContain('border-[#E6DCCB]');
    expect(promoSource).toContain('text-brand-secondary');
    expect(promoSource).toContain('Book Now');
  });

  it('verifies Mobile navigation drawer menu adheres to Bright Creamy Luxury theme', () => {
    const overlaySource = fs.readFileSync(path.resolve(__dirname, '../src/components/ui/Overlay.tsx'), 'utf-8');

    // 1. Drawer Container: Warm Ivory #FAF7F0
    expect(overlaySource).toContain('bg-[#FAF7F0]');
    expect(overlaySource).toContain('border-[#E6DCCB]');

    // 2. MENU Title & Close Icon: Deep Charcoal #211D18
    expect(overlaySource).toContain('text-[#211D18]');

    // 3. Search Bar in Drawer: White with subtle beige border & charcoal text
    expect(navbarSource).toContain('id="drawer-search-trigger"');
    expect(navbarSource).toContain('bg-white border border-[#E6DCCB]');

    // 4. Navigation Link Cards: White/Cream cards, charcoal text, champagne-gold active state
    expect(navbarSource).toContain('id="drawer-links-nav"');
    expect(navbarSource).toContain('bg-[#F1E9DC] border border-brand-secondary/70 text-brand-secondary');
    expect(navbarSource).toContain('bg-white border border-[#E6DCCB]');
    expect(navbarSource).toContain('text-[#211D18]');

    // 5. Bottom Reserve Experience CTA: Champagne gold with deep charcoal text
    expect(navbarSource).toContain('id="drawer-book-btn"');
    expect(navbarSource).toContain('text-[#211D18] bg-brand-secondary hover:bg-[#D8B77A]');

    // 6. Contact Details: Beige border and high-contrast typography
    expect(navbarSource).toContain('id="drawer-contact-details"');
    expect(navbarSource).toContain('border-[#E6DCCB]');
    expect(navbarSource).toContain('text-[#211D18]');
  });

  it('verifies entire Website Footer adheres to Bright Creamy Luxury theme', () => {
    const footerSource = fs.readFileSync(path.resolve(__dirname, '../src/components/layout/Footer.tsx'), 'utf-8');

    // 1. Background Warm Ivory #FAF7F0
    expect(footerSource).toContain('bg-[#FAF7F0]');
    expect(footerSource).toContain('border-[#E6DCCB]');

    // 2. Newsletter Card: Soft Cream #F1E9DC
    expect(footerSource).toContain('id="footer-newsletter-column"');
    expect(footerSource).toContain('bg-[#F1E9DC]');
    expect(footerSource).toContain('text-[#211D18]');

    // 3. Email Input: White with beige border
    expect(footerSource).toContain('id="newsletter-email"');
    expect(footerSource).toContain('bg-white');
    expect(footerSource).toContain('border-[#E6DCCB]');

    // 4. Subscribe Button: Champagne Gold with Deep Charcoal text
    expect(footerSource).toContain('id="newsletter-submit"');
    expect(footerSource).toContain('bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18]');

    // 5. Social Icons: White card with beige border and champagne gold icons
    expect(footerSource).toContain('id="footer-social-ig"');
    expect(footerSource).toContain('id="footer-social-fb"');
    expect(footerSource).toContain('border-[#E6DCCB]');
    expect(footerSource).toContain('bg-white');

    // 6. Links and 4 Columns: Deep charcoal headings, warm taupe body text
    expect(footerSource).toContain('id="footer-links-grid"');
    expect(footerSource).toContain('text-[#746B60]');
    expect(footerSource).toContain('text-brand-secondary');

    // 7. Salon Concierge Column: High contrast text and champagne gold details
    expect(footerSource).toContain('id="footer-contact-column"');
    expect(footerSource).toContain('text-[#211D18]');
    expect(footerSource).toContain('text-[11px] text-brand-secondary');
  });

  it('verifies Services catalog and Service detail pages adhere to Bright Creamy Luxury theme', () => {
    const servicesSource = fs.readFileSync(path.resolve(__dirname, '../src/components/services/ServicesPage.tsx'), 'utf-8');
    const detailSource = fs.readFileSync(path.resolve(__dirname, '../src/components/services/ServiceDetailPage.tsx'), 'utf-8');

    // 1. Patron Profile section background is soft cream #F1E9DC
    expect(servicesSource).toContain('id="recipient-selection-section"');
    expect(servicesSource).toContain('bg-[#F1E9DC]');
    expect(servicesSource).toContain('text-[#211D18]');
    expect(servicesSource).toContain('Select Patron Profile');

    // 2. Royal Welcome Courtesy banner is completely removed from Services page
    expect(servicesSource).not.toContain('id="special-offers-section"');
    expect(servicesSource).not.toContain('The Royal Welcome Courtesy');
    expect(servicesSource).not.toContain('ROYAL15');

    // 3. Search and Sort controls container is white, with beige borders and readable inputs
    expect(servicesSource).toContain('id="catalog-search"');
    expect(servicesSource).toContain('id="catalog-sorter"');
    expect(servicesSource).toContain('bg-white');
    expect(servicesSource).toContain('bg-[#FAF7F0]');
    expect(servicesSource).toContain('text-[#211D18]');

    // 4. Salon Category rail is white with inactive tabs on #FAF7F0 and active tabs in champagne gold
    expect(servicesSource).toContain('id="category-filter-rail"');
    expect(servicesSource).toContain('bg-white');
    expect(servicesSource).toContain('11 Clear Salon Categories');
    expect(servicesSource).toContain('bg-brand-secondary border-brand-secondary text-[#211D18]');

    // 5. Service cards information details box uses high-contrast light surface
    expect(servicesSource).toContain('bg-white/95');
    expect(servicesSource).toContain('border-[#E6DCCB]');

    // 6. ServiceDetailPage sticky booking bar is white with deep charcoal typography
    expect(detailSource).toContain('id="sticky-booking-bar"');
    expect(detailSource).toContain('bg-white/95');
    expect(detailSource).toContain('border-[#E6DCCB]');
    expect(detailSource).toContain('text-[#211D18]');
    expect(detailSource).toContain('Book Experience');

    // 7. ServiceDetailPage rate tiers, inclusions, and related cards use white surfaces
    expect(detailSource).toContain('bg-white');
    expect(detailSource).toContain('border-[#E6DCCB]');
    expect(detailSource).toContain('text-[#211D18]');
  });

  it('verifies GlobalSearchModal adheres to Bright Creamy Luxury tokens', () => {
    expect(searchModalSource).toContain('bg-[#FAF7F0]');
    expect(searchModalSource).toContain('border-[#E6DCCB]');
    expect(searchModalSource).toContain('bg-[#F1E9DC]');
    expect(searchModalSource).toContain('text-[#211D18]');
    expect(searchModalSource).toContain('placeholder-[#746B60]');
    expect(searchModalSource).toContain('bg-white');
  });

  it('verifies BookingFlow adheres to Bright Creamy Luxury tokens', () => {
    expect(bookingSource).toContain('bg-[#F1E9DC]');
    expect(bookingSource).toContain('bg-[#FAF7F0]');
    expect(bookingSource).toContain('border-[#E6DCCB]');
    expect(bookingSource).toContain('text-[#211D18]');
    expect(bookingSource).toContain('bg-white border border-[#E6DCCB]');
  });
});
