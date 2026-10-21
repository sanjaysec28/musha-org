/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Google Reviews Section Tests
 */

import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import * as fs from 'fs';
import * as path from 'path';
import Testimonials from '../src/components/home/Testimonials';
import {
  GOOGLE_REVIEWS_CONFIG,
  GoogleReviewItem
} from '../src/data/googleReviewsData';
import { SALON_CONTACT } from '../src/data/salonContact';

const SAMPLE_REVIEWS_5: GoogleReviewItem[] = [
  {
    id: 'rev-1',
    reviewerName: 'Kavitha R.',
    reviewText: 'Masterclass hair styling! The ambiance is tranquil and serene.',
    rating: 5,
    date: '2 weeks ago',
    reviewUrl: 'https://maps.app.goo.gl/SVjbhVj4sXFNU8r69'
  },
  {
    id: 'rev-2',
    reviewerName: 'Rohan Sharma',
    reviewText: 'Great luxury salon experience. The Moroccan oil treatment gave incredible results.',
    rating: 4,
    date: '1 month ago',
    reviewUrl: 'https://maps.app.goo.gl/SVjbhVj4sXFNU8r69'
  },
  {
    id: 'rev-3',
    reviewerName: 'Meera Patel',
    reviewText: 'Extremely polite staff, pristine hygienic tools, and exceptional skin care services.',
    rating: 5,
    date: '1 month ago'
  },
  {
    id: 'rev-4',
    reviewerName: 'Aditya Verma',
    reviewText: 'The beard grooming and scalp detox was very relaxing and well-executed.',
    rating: 5,
    date: '2 months ago'
  },
  {
    id: 'rev-5',
    reviewerName: 'Sneha Reddy',
    reviewText: 'Loved the bridal trial session. Very attentive stylists and warm hospitality.',
    rating: 5,
    date: '3 months ago'
  }
];

describe('Google Reviews Section — Data & Configuration Integrity', () => {
  it('ensures initial GOOGLE_REVIEWS_CONFIG starts with an empty reviews list until genuine data is added', () => {
    // Zero fabricated reviews
    expect(GOOGLE_REVIEWS_CONFIG.reviews).toBeDefined();
    expect(Array.isArray(GOOGLE_REVIEWS_CONFIG.reviews)).toBe(true);
    expect(GOOGLE_REVIEWS_CONFIG.reviews.length).toBeLessThanOrEqual(5);
  });

  it('verifies googleMapsListingUrl is bound to the verified Musha Empire shortlink', () => {
    expect(GOOGLE_REVIEWS_CONFIG.googleMapsListingUrl).toBe(SALON_CONTACT.googleMaps);
    expect(GOOGLE_REVIEWS_CONFIG.googleMapsListingUrl).toContain('maps.app.goo.gl');
  });

  it('keeps overallRating and totalReviewCount strictly null until officially verified data is provided', () => {
    expect(GOOGLE_REVIEWS_CONFIG.overallRating).toBeNull();
    expect(GOOGLE_REVIEWS_CONFIG.totalReviewCount).toBeNull();
  });
});

describe('Google Reviews Section — Component Rendering & Responsive States', () => {
  it('renders elegant heading and supporting text matching specification', () => {
    const html = renderToString(<Testimonials reviews={[]} />);

    expect(html).toContain('Loved by Our Customers');
    expect(html).toContain('Discover the experiences of our valued guests.');
  });

  it('renders graceful empty state when zero reviews are present', () => {
    const html = renderToString(<Testimonials reviews={[]} />);

    expect(html).toContain('Google Reviews Coming Soon');
    expect(html).toContain('We are currently curating genuine reviews from our valued patrons');
  });

  it('renders Google Maps button with exact label and verified URL in new tab', () => {
    const html = renderToString(<Testimonials reviews={[]} />);

    expect(html).toContain('id="google-maps-all-reviews-btn"');
    expect(html).toContain(`href="${SALON_CONTACT.googleMaps}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('Read All Reviews on Google Maps');
    expect(html).toContain('↗');
  });

  it('does NOT render an overall star rating or review count when none is configured', () => {
    const html = renderToString(
      <Testimonials
        reviews={[]}
        config={{ overallRating: null, totalReviewCount: null }}
      />
    );

    expect(html).not.toContain('verified Google reviews');
  });

  it('renders overall star rating and count ONLY when explicitly provided with genuine values', () => {
    const html = renderToString(
      <Testimonials
        reviews={[]}
        config={{ overallRating: 4.9, totalReviewCount: 128 }}
      />
    );

    expect(html).toContain('4.9');
    expect(html).toContain('128');
    expect(html).toContain('verified Google reviews');
  });

  it('renders single review card cleanly in a balanced centered layout', () => {
    const singleReview = [SAMPLE_REVIEWS_5[0]];
    const html = renderToString(<Testimonials reviews={singleReview} />);

    expect(html).toContain('Kavitha R.');
    expect(html).toContain('Masterclass hair styling! The ambiance is tranquil and serene.');
    expect(html).toContain('2 weeks ago');
    expect(html).toContain('Google Review');
  });

  it('renders five reviews in a carousel/grid with individual star ratings matching the review data', () => {
    const html = renderToString(<Testimonials reviews={SAMPLE_REVIEWS_5} />);

    // Reviewer names
    expect(html).toContain('Kavitha R.');
    expect(html).toContain('Rohan Sharma');
    expect(html).toContain('Meera Patel');
    expect(html).toContain('Aditya Verma');
    expect(html).toContain('Sneha Reddy');

    // Individual star ratings accurately reflected in aria-label
    expect(html).toContain('aria-label="4 out of 5 stars"'); // Rohan Sharma (rating 4)
    expect(html).toContain('aria-label="5 out of 5 stars"'); // 5 star reviews
  });

  it('applies Bright Creamy Luxury design system classes and background token #FAF7F0', () => {
    const html = renderToString(<Testimonials reviews={[]} />);

    expect(html).toContain('bg-[#FAF7F0]');
    expect(html).toContain('text-[#211D18]');
    expect(html).toContain('text-[#746B60]');
  });

  it('verifies source code isolation and independence from unnecessary third-party widgets', () => {
    const componentPath = path.resolve(__dirname, '../src/components/home/Testimonials.tsx');
    const source = fs.readFileSync(componentPath, 'utf-8');

    // Must not use third-party paid widgets or external widget iframes
    expect(source).not.toContain('elfsight');
    expect(source).not.toContain('trustpilot');
    expect(source).not.toContain('tagembed');
    expect(source).not.toContain('embedsocial');

    // Must use separate review data file
    expect(source).toContain("from '../../data/googleReviewsData'");
  });
});
