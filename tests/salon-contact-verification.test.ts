/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Saloon — Verified Contact Details Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SALON_CONTACT } from '../src/data/salonContact';

describe('Musha Empire Unisex Saloon — Verified Contact Details', () => {
  it('contains the exact verified business name: Musha Empire Unisex Saloon', () => {
    expect(SALON_CONTACT.businessName).toBe('Musha Empire Unisex Saloon');
  });

  it('contains verified phone number 9866668715 and tel link', () => {
    expect(SALON_CONTACT.phone).toBe('9866668715');
    expect(SALON_CONTACT.phoneTel).toBe('tel:9866668715');
  });

  it('contains verified email mushaempire1238@gmail.com and mailto link', () => {
    expect(SALON_CONTACT.email).toBe('mushaempire1238@gmail.com');
    expect(SALON_CONTACT.emailMailto).toBe('mailto:mushaempire1238@gmail.com');
  });

  it('contains verified Instagram link pointing to the saloon profile', () => {
    expect(SALON_CONTACT.instagram).toBe('https://www.instagram.com/musha_empire_unisex_saloon/');
  });

  it('contains verified Google Maps link pointing to the exact shortlink', () => {
    expect(SALON_CONTACT.googleMaps).toBe('https://maps.app.goo.gl/SVjbhVj4sXFNU8r69?g_st=aw');
  });

  it('verifies ContactPage source imports and wires SALON_CONTACT details', () => {
    const contactPagePath = path.resolve(__dirname, '../src/components/pages/ContactPage.tsx');
    const source = fs.readFileSync(contactPagePath, 'utf-8');

    expect(source).toContain("import { SALON_CONTACT } from '../../data/salonContact'");
    expect(source).toContain('SALON_CONTACT.googleMaps');
    expect(source).toContain('SALON_CONTACT.phoneTel');
    expect(source).toContain('SALON_CONTACT.emailMailto');
    expect(source).toContain('SALON_CONTACT.instagram');
    expect(source).toContain('SALON_CONTACT.businessName');
  });

  it('verifies Footer source imports and wires SALON_CONTACT details', () => {
    const footerPath = path.resolve(__dirname, '../src/components/layout/Footer.tsx');
    const source = fs.readFileSync(footerPath, 'utf-8');

    expect(source).toContain("import { SALON_CONTACT } from '../../data/salonContact'");
    expect(source).toContain('SALON_CONTACT.googleMaps');
    expect(source).toContain('SALON_CONTACT.phoneTel');
    expect(source).toContain('SALON_CONTACT.emailMailto');
    expect(source).toContain('SALON_CONTACT.instagram');
    expect(source).toContain('SALON_CONTACT.businessName');
  });

  it('verifies Navbar source imports and wires SALON_CONTACT details', () => {
    const navbarPath = path.resolve(__dirname, '../src/components/layout/Navbar.tsx');
    const source = fs.readFileSync(navbarPath, 'utf-8');

    expect(source).toContain("import { SALON_CONTACT } from '../../data/salonContact'");
    expect(source).toContain('SALON_CONTACT.phoneTel');
    expect(source).toContain('SALON_CONTACT.googleMaps');
    expect(source).toContain('SALON_CONTACT.instagram');
  });

  it('verifies Booking component wires SALON_CONTACT details', () => {
    const bookingPath = path.resolve(__dirname, '../src/components/home/Booking.tsx');
    const source = fs.readFileSync(bookingPath, 'utf-8');

    expect(source).toContain("import { SALON_CONTACT } from '../../data/salonContact'");
    expect(source).toContain('SALON_CONTACT.googleMaps');
    expect(source).toContain('SALON_CONTACT.phoneTel');
    expect(source).toContain('SALON_CONTACT.businessName');
  });
});
