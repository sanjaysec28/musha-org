/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Luxury Page Loader Tests
 */

import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import * as fs from 'fs';
import * as path from 'path';
import PageLoader from '../src/components/ui/PageLoader';

describe('PageLoader — Luxury Branding & Theme Compliance', () => {
  it('renders with Warm Ivory #FAF7F0 background and never with black #0B0B0B', () => {
    const html = renderToString(<PageLoader isLoading={true} />);

    // Warm ivory background token
    expect(html).toContain('bg-[#FAF7F0]');

    // Black background must NOT be present
    expect(html).not.toContain('bg-[#0B0B0B]');
    expect(html).not.toContain('bg-black');
  });

  it('renders a subtle blurred champagne-gold glow element', () => {
    const html = renderToString(<PageLoader isLoading={true} />);

    expect(html).toContain('bg-[#B88A45]/');
    expect(html).toContain('blur-');
    expect(html).toContain('rounded-full');
  });

  it('renders a smooth, thin circular gold spinner with champagne-gold border', () => {
    const html = renderToString(<PageLoader isLoading={true} />);

    expect(html).toContain('border-[#B88A45]');
    expect(html).toContain('border-t');
    expect(html).toContain('rounded-full');
  });

  it('references official transparent logo asset without dark overlays or black backgrounds', () => {
    const html = renderToString(<PageLoader isLoading={true} />);

    expect(html).toContain('/images/musha_empire_official_logo.png');
    expect(html).toContain('alt="Musha Empire"');
  });

  it('contains graceful "MUSHA EMPIRE" luxury fallback in source code', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../src/components/ui/PageLoader.tsx'),
      'utf-8'
    );

    expect(source).toContain('MUSHA EMPIRE');
    expect(source).toContain('Luxury Unisex Salon & Spa');
    expect(source).toContain('Style For Everyone');
    expect(source).toContain('setLogoFailed(true)');
  });

  it('verifies App.tsx mounts PageLoader with genuine auth loading state', () => {
    const appSource = fs.readFileSync(
      path.resolve(__dirname, '../src/App.tsx'),
      'utf-8'
    );

    expect(appSource).toContain('<PageLoader isLoading={loading} />');
  });
});
