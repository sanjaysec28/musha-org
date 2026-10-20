/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Check, Tag } from 'lucide-react';

export interface PromotionOffer {
  id: string;
  category: string;
  badge: string;
  title: string;
  shortDescription: string;
  price: string;
  offerDetails: string;
  inclusions: string[];
  serviceId: string;
  image: string;
}

export const HOMEPAGE_PROMOTIONS: PromotionOffer[] = [
  {
    id: 'promo-hair-color',
    category: 'Hair Color Offers',
    badge: 'Artistry Privilege',
    title: 'Hair Color Artistry',
    shortDescription: 'Multi-dimensional balayage, global coloring & root revival powered by L’Oréal Professionnel & Schwarzkopf with custom color lock therapy.',
    price: 'From ₹499',
    offerDetails: 'Root Touch-Up: ₹499 - ₹899 • Global Color from ₹2,000',
    inclusions: [
      'Master colorist shade consultation',
      'L’Oréal / Schwarzkopf custom formulation',
      'Post-color lock bath & nourishing mask'
    ],
    serviceId: 'queens-color-loreal-schwarzkopf',
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'promo-bridal-packages',
    category: 'Bridal Packages',
    badge: 'Pre-Wedding Suite',
    title: 'Imperial Bridal Packages',
    shortDescription: 'Comprehensive 4-sitting royal transformation spanning designer haircut, glow facials, hair spa, body polishing, and luxury mani-pedi.',
    price: '₹24,000',
    offerDetails: 'Full 4-Sitting Bridal Suite • Grooms Ritual (2-Sittings): ₹5,999',
    inclusions: [
      'Facial & skin mapping 1-on-1 session',
      'Full body waxing & botanical body polishing',
      'Nourishing hair spa & HD bridal styling'
    ],
    serviceId: 'bridal-bride-package-4-sittings',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'promo-festival-offers',
    category: 'Festival Offers',
    badge: 'Festive Privilege',
    title: 'Festive Radiance Privileges',
    shortDescription: 'Illuminate the celebration season with curated royal facials and holistic skin wellness rituals. Enjoy 15% privilege credit across festive treatments.',
    price: '15% Privilege Credit',
    offerDetails: 'Quote Code ROYAL15 at Booking • Facials from ₹800 to ₹3,500',
    inclusions: [
      'The Royal Glow fruit, gold & O3/Korean facials',
      '15% privilege credit with voucher code ROYAL15',
      'Complimentary herbal scalp elixir & infusion'
    ],
    serviceId: 'queens-facials',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'promo-combo-offers',
    category: 'Combo Offers',
    badge: "King's Featured Value",
    title: 'Signature Grooming Combos',
    shortDescription: 'Master clipper and scissor haircut paired with precision hot towel beard sculpting, clarifying rinse, and restorative facial massage.',
    price: 'From ₹129 - ₹259',
    offerDetails: 'HairCut + Beard: ₹129 - ₹259 • De-Tan & Scrub: ₹459',
    inclusions: [
      'Master scissor & clipper haircut styling',
      'Precision beard shaping & razor contour',
      'Conditioning beard oil & hot towel finish'
    ],
    serviceId: 'combo-haircut-beard',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80'
  }
];

export interface PromotionalOffersProps {
  onBookService?: (serviceId: string) => void;
  onExploreOffers?: () => void;
}

export default function PromotionalOffers({
  onBookService,
  onExploreOffers
}: PromotionalOffersProps) {
  const handleBook = (serviceId: string) => {
    if (onBookService) {
      onBookService(serviceId);
    }
  };

  return (
    <section
      id="promotions"
      className="relative py-16 sm:py-20 md:py-24 bg-brand-bg border-b border-brand-secondary/15 overflow-hidden"
    >
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/25">
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-brand-secondary">
                Curated Privileges & Signature Offers
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-primary tracking-tight">
              Exclusive Salon Promotions
            </h2>
            <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed max-w-2xl font-normal">
              Indulge in our most sought-after seasonal privileges—from certified hair color chemistry and complete bridal suites to festive radiance and bespoke grooming combos.
            </p>
          </div>

          {onExploreOffers && (
            <button
              onClick={onExploreOffers}
              className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold text-brand-secondary hover:text-[#E7D2B4] group transition-colors duration-200 cursor-pointer self-start md:self-end"
            >
              <span>View All Offers</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* 2x2 Grid on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {HOMEPAGE_PROMOTIONS.map((promo, idx) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl md:rounded-3xl border border-[#E6DCCB] dark:border-brand-secondary/20 bg-white dark:bg-[#121212] overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(33,29,24,0.06)] dark:shadow-xl hover:border-brand-secondary/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-brand-secondary/10 motion-reduce:transform-none"
            >
              {/* Upper Section: Salon Photography Banner with Controlled Dark Overlay */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-brand-surface-muted shrink-0">
                <img
                  src={promo.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                  alt={promo.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
                  loading="lazy"
                />
                {/* Controlled Dark Overlay to keep image rich and badges high-contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-semibold bg-black/65 backdrop-blur-md border border-brand-secondary/40 text-brand-secondary shadow-sm">
                    <Tag className="w-3 h-3 text-brand-secondary" />
                    {promo.category}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#211D18] bg-brand-secondary font-bold backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                    {promo.badge}
                  </span>
                </div>
              </div>

              {/* Clean White or Warm-Cream Information Panel */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6 bg-white dark:bg-[#121212] text-[#211D18] dark:text-white border-t border-[#E6DCCB] dark:border-brand-secondary/20">
                {/* Title & Short Description */}
                <div className="space-y-3">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#211D18] dark:text-white tracking-tight group-hover:text-brand-secondary transition-colors duration-300">
                    {promo.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-[13px] text-[#746B60] dark:text-neutral-400 leading-relaxed font-normal">
                    {promo.shortDescription}
                  </p>
                </div>

                {/* Offer Details & Inclusions Box */}
                <div className="bg-[#FAF7F0] dark:bg-[#181818] border border-[#E6DCCB] dark:border-brand-secondary/20 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#746B60] dark:text-neutral-400 font-semibold">
                        Featured Rate:
                      </span>
                      <span className="font-heading text-lg sm:text-xl font-bold text-brand-secondary">
                        {promo.price}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#746B60] dark:text-neutral-300 font-medium">
                      {promo.offerDetails}
                    </span>
                  </div>

                  <div className="border-t border-[#E6DCCB] dark:border-brand-secondary/20 pt-3">
                    <ul className="space-y-1.5">
                      {promo.inclusions.map((inclusion, iIdx) => (
                        <li
                          key={iIdx}
                          className="flex items-start gap-2 text-[11px] sm:text-xs text-[#211D18] dark:text-neutral-200 font-sans"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-brand-secondary/15 border border-brand-secondary/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-brand-secondary" />
                          </span>
                          <span className="leading-snug">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Section: Book Now CTA */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    id={`book-now-${promo.id}`}
                    onClick={() => handleBook(promo.serviceId)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold uppercase tracking-wider bg-brand-secondary text-[#211D18] hover:bg-[#D8B77A] hover:shadow-lg hover:shadow-brand-secondary/20 transition-all duration-300 group/btn cursor-pointer active:scale-[0.98]"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                  </button>
                  <span className="hidden sm:inline-block font-mono text-[10px] text-[#746B60] dark:text-brand-secondary/70 tracking-wider uppercase font-medium">
                    Instant Confirmation
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
