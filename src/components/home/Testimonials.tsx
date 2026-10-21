/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Premium Google Reviews Section
 * 
 * Design System: Bright Creamy Luxury
 * - Background: #FAF7F0
 * - Review cards: #FFFFFF
 * - Primary text: #211D18
 * - Secondary text: #746B60
 * - Gold accents: #B88A45 and #D8B77A
 * - Borders: #E6DCCB
 */

import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import {
  GOOGLE_REVIEWS_CONFIG,
  GoogleReviewItem,
  GoogleReviewsConfig
} from '../../data/googleReviewsData';

export interface TestimonialsProps {
  id?: string;
  className?: string;
  reviews?: GoogleReviewItem[];
  config?: Partial<GoogleReviewsConfig>;
}

/**
 * Clean inline Google "G" brand icon
 */
function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Star rating component accurately reflecting individual review rating (1 to 5)
 */
function RatingStars({ rating }: { rating: number }) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
      role="img"
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < safeRating;
        return (
          <Star
            key={index}
            className={`w-4 h-4 transition-colors ${
              isFilled
                ? 'text-[#B88A45] fill-[#B88A45]'
                : 'text-[#E6DCCB] fill-transparent'
            }`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export default function Testimonials({
  id = 'testimonials',
  className = '',
  reviews: propReviews,
  config: propConfig
}: TestimonialsProps) {
  // Merge configurations with defaults
  const activeReviews = propReviews !== undefined ? propReviews : GOOGLE_REVIEWS_CONFIG.reviews;
  const activeConfig: GoogleReviewsConfig = {
    ...GOOGLE_REVIEWS_CONFIG,
    ...propConfig
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Monitor scroll capabilities
  const updateScrollButtons = () => {
    const el = carouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate active slide
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / (clientWidth * 0.85));
      setActiveSlideIndex(Math.min(activeReviews.length - 1, Math.max(0, index)));
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        el.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [activeReviews.length]);

  const scrollByCard = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>('[data-review-card]')?.offsetWidth || 340;
    const scrollAmount = direction === 'left' ? -cardWidth - 24 : cardWidth + 24;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const hasReviews = activeReviews && activeReviews.length > 0;
  const displayReviews = hasReviews ? activeReviews.slice(0, 5) : [];

  // Reliable aggregate rating check: Only display if explicitly configured
  const showAggregateRating =
    typeof activeConfig.overallRating === 'number' &&
    typeof activeConfig.totalReviewCount === 'number';

  return (
    <section
      id={id}
      aria-labelledby="reviews-heading"
      className={`py-20 sm:py-24 bg-[#FAF7F0] border-y border-[#E6DCCB]/60 relative overflow-hidden ${className}`}
    >
      {/* Subtle warm atmospheric glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#B88A45]/[0.03] rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2
            id="reviews-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#211D18] tracking-tight text-balance"
          >
            Loved by Our Customers
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#746B60] font-sans font-normal leading-relaxed">
            Discover the experiences of our valued guests.
          </p>

          {/* Genuine aggregate rating and count displayed ONLY if reliably configured */}
          {showAggregateRating && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6DCCB] shadow-sm">
              <GoogleIcon className="w-4 h-4" />
              <span className="font-sans text-xs font-semibold text-[#211D18]">
                {activeConfig.overallRating?.toFixed(1)}
              </span>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 text-[#B88A45] fill-[#B88A45]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-[#746B60] text-xs font-sans">
                ({activeConfig.totalReviewCount} verified Google reviews)
              </span>
            </div>
          )}
        </div>

        {/* Reviews Cards Display or Graceful Empty State */}
        {!hasReviews ? (
          /* Graceful Empty State (Clean, unforced, waiting for genuine reviews) */
          <div className="max-w-xl mx-auto">
            <div
              id="google-reviews-empty-state"
              className="bg-white border border-[#E6DCCB] rounded-2xl p-8 sm:p-10 text-center shadow-[0_4px_20px_rgba(33,29,24,0.03)]"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center mb-4">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#211D18]">
                Google Reviews Coming Soon
              </h3>
              <p className="mt-2 text-sm text-[#746B60] font-sans leading-relaxed max-w-md mx-auto">
                We are currently curating genuine reviews from our valued patrons on Google.
                Visit our verified listing on Google Maps to explore our guest experiences.
              </p>
            </div>
          </div>
        ) : displayReviews.length <= 3 ? (
          /* Responsive Balanced Grid (for 1 to 3 reviews) */
          <div
            className={`grid gap-6 ${
              displayReviews.length === 1
                ? 'max-w-xl mx-auto grid-cols-1'
                : displayReviews.length === 2
                ? 'max-w-4xl mx-auto grid-cols-1 md:grid-cols-2'
                : 'max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {displayReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          /* Responsive Horizontal Carousel / Grid (for 4 to 5 reviews) */
          <div className="relative">
            {/* Desktop Navigation Arrows */}
            <div className="hidden sm:flex items-center justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => scrollByCard('left')}
                disabled={!canScrollLeft}
                aria-label="Previous review"
                className={`w-10 h-10 rounded-full border border-[#E6DCCB] bg-white flex items-center justify-center text-[#211D18] transition-all duration-200 ${
                  canScrollLeft
                    ? 'hover:border-[#B88A45] hover:text-[#B88A45] hover:shadow-sm cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard('right')}
                disabled={!canScrollRight}
                aria-label="Next review"
                className={`w-10 h-10 rounded-full border border-[#E6DCCB] bg-white flex items-center justify-center text-[#211D18] transition-all duration-200 ${
                  canScrollRight
                    ? 'hover:border-[#B88A45] hover:text-[#B88A45] hover:shadow-sm cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Track */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-6 pt-1 px-1 snap-x snap-mandatory scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A45] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              tabIndex={0}
              role="region"
              aria-label="Customer Reviews Carousel"
            >
              {displayReviews.map((review) => (
                <div
                  key={review.id}
                  data-review-card
                  className="w-[85vw] sm:w-[380px] lg:w-[390px] shrink-0 snap-start"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>

            {/* Mobile Carousel Indicators */}
            <div className="flex sm:hidden justify-center items-center gap-1.5 mt-4">
              {displayReviews.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeSlideIndex
                      ? 'w-6 bg-[#B88A45]'
                      : 'w-1.5 bg-[#E6DCCB]'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}

        {/* Centered Premium Google Maps Button */}
        <div className="mt-12 sm:mt-14 text-center">
          <a
            id="google-maps-all-reviews-btn"
            href={activeConfig.googleMapsListingUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read All Reviews on Google Maps (opens in a new tab)"
            className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 bg-white hover:bg-[#FAF7F0] border border-[#B88A45]/40 hover:border-[#B88A45] text-[#211D18] hover:text-[#B88A45] rounded-full shadow-[0_2px_12px_rgba(33,29,24,0.04)] hover:shadow-[0_4px_20px_rgba(184,138,69,0.12)] transition-all duration-300 font-sans text-sm sm:text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A45] focus-visible:ring-offset-2"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap tracking-wide">
              Read All Reviews on Google Maps
            </span>
            <span
              aria-hidden="true"
              className="text-[#B88A45] font-serif transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Individual Review Card component adhering strictly to Bright Creamy Luxury tokens
 */
function ReviewCard({ review }: { review: GoogleReviewItem }) {
  return (
    <article
      className="h-full bg-white border border-[#E6DCCB] hover:border-[#D8B77A] rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(33,29,24,0.03)] hover:shadow-[0_12px_30px_rgba(33,29,24,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
      aria-label={`Review by ${review.reviewerName}`}
    >
      <div>
        {/* Top Header: Star Rating and Google Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <RatingStars rating={review.rating} />

          <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#746B60] shrink-0">
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>Google Review</span>
          </div>
        </div>

        {/* Original Review Text */}
        <p className="text-sm sm:text-[15px] text-[#211D18] font-sans leading-relaxed break-words line-clamp-none">
          "{review.reviewText}"
        </p>
      </div>

      {/* Reviewer Details Footer */}
      <div className="mt-6 pt-4 border-t border-[#E6DCCB]/60 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans font-semibold text-sm text-[#211D18] truncate">
            {review.reviewerName}
          </p>
          {review.date && (
            <p className="font-sans text-xs text-[#746B60] mt-0.5">
              {review.date}
            </p>
          )}
        </div>

        {review.reviewUrl && (
          <a
            href={review.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${review.reviewerName}'s review on Google Maps`}
            className="p-1.5 text-[#746B60] hover:text-[#B88A45] transition-colors rounded-md hover:bg-[#FAF7F0]"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}
