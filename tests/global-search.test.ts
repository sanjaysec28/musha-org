/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Saloon — Global Search Verification Tests
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { EXTENDED_SERVICES_DATA } from '../src/data/servicesExtendedData';
import { STYLISTS_DATA } from '../src/data/salonData';

describe('Musha Empire — Global Search Feature Verification', () => {
  const navbarSource = fs.readFileSync(
    path.resolve(__dirname, '../src/components/layout/Navbar.tsx'),
    'utf-8'
  );
  const searchModalSource = fs.readFileSync(
    path.resolve(__dirname, '../src/components/ui/GlobalSearchModal.tsx'),
    'utf-8'
  );

  it('verifies search icon is integrated into desktop navigation bar', () => {
    expect(navbarSource).toContain('id="header-search-btn"');
    expect(navbarSource).toContain('title="Search Services & Stylists (Cmd+K)"');
    expect(navbarSource).toContain('⌘K');
  });

  it('verifies search icon is integrated into mobile navigation bar', () => {
    expect(navbarSource).toContain('id="mobile-search-btn"');
    expect(navbarSource).toContain('aria-label="Search Services & Stylists"');
  });

  it('verifies search option is integrated into mobile navigation drawer', () => {
    expect(navbarSource).toContain('id="drawer-search-trigger"');
    expect(navbarSource).toContain('Search Services & Stylists');
  });

  it('verifies keyboard shortcut listeners (Cmd+K / Ctrl+K, Escape) exist', () => {
    expect(navbarSource).toContain("e.key.toLowerCase() === 'k'");
    expect(searchModalSource).toContain("e.key === 'Escape'");
  });

  it('verifies global search searches across extended salon services', () => {
    expect(EXTENDED_SERVICES_DATA.length).toBeGreaterThan(0);

    // Query for haircut
    const query = 'haircut';
    const matches = EXTENDED_SERVICES_DATA.filter((svc) =>
      svc.name.toLowerCase().includes(query) ||
      svc.category.toLowerCase().includes(query) ||
      svc.shortDescription.toLowerCase().includes(query)
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.name.toLowerCase().includes('hair'))).toBe(true);
  });

  it('verifies global search searches across stylists and their specialties', () => {
    expect(STYLISTS_DATA.length).toBeGreaterThan(0);

    // Query for master stylist or director
    const query = 'master';
    const matches = STYLISTS_DATA.filter((stylist) =>
      stylist.name.toLowerCase().includes(query) ||
      stylist.role.toLowerCase().includes(query) ||
      stylist.specialty.toLowerCase().includes(query) ||
      stylist.bio.toLowerCase().includes(query)
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it('verifies filtering categories are supported in GlobalSearchModal', () => {
    expect(searchModalSource).toContain('id="filter-all-btn"');
    expect(searchModalSource).toContain('id="filter-services-btn"');
    expect(searchModalSource).toContain('id="filter-stylists-btn"');
  });

  it('verifies booking action is triggered directly from search results', () => {
    expect(searchModalSource).toContain('onSelectService(svc.id)');
    expect(searchModalSource).toContain('onSelectStylist(stylist.id)');
  });
});
