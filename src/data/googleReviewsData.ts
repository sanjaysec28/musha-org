/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Manually Configured Genuine Google Reviews Data Source
 */

import { SALON_CONTACT } from './salonContact';

export interface GoogleReviewItem {
  id: string;
  reviewerName: string;
  reviewText: string;
  rating: number; // 1 to 5 stars
  date?: string; // e.g. "October 2026", "2 weeks ago"
  reviewerAvatarUrl?: string; // Optional real profile avatar
  reviewUrl?: string; // Direct link to this specific Google review if available
}

export interface GoogleReviewsConfig {
  /**
   * Authoritative Google Maps listing URL for Musha Empire.
   * Defaults to the verified Google Maps shortlink in SALON_CONTACT.
   */
  googleMapsListingUrl: string;

  /**
   * Overall Google star rating (e.g. 4.9).
   * Kept null until verified genuine rating is officially provided.
   */
  overallRating?: number | null;

  /**
   * Total count of verified reviews on Google Maps.
   * Kept null until verified count is officially provided.
   */
  totalReviewCount?: number | null;

  /**
   * Up to 5 genuine Google reviews manually configured.
   * Kept empty until genuine reviews are added by the owner.
   */
  reviews: GoogleReviewItem[];
}

export const GOOGLE_REVIEWS_CONFIG: GoogleReviewsConfig = {
  // Verified Musha Empire Google Maps listing shortlink
  googleMapsListingUrl: SALON_CONTACT.googleMaps,
  overallRating: null, // Strictly null until verified genuine aggregate data is provided
  totalReviewCount: null, // Strictly null until verified genuine count is provided
  reviews: [
    // Genuine Google customer reviews can be populated here (up to 5 items).
    // Example format:
    // {
    //   id: 'google-rev-1',
    //   reviewerName: 'Priya Sundaram',
    //   reviewText: 'Exceptional service and beautiful ambiance. The hair spa and styling exceeded my expectations.',
    //   rating: 5,
    //   date: '2 weeks ago',
    //   reviewUrl: 'https://maps.app.goo.gl/SVjbhVj4sXFNU8r69'
    // }
  ]
};
