/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Award, Sparkles, Star, Users } from 'lucide-react';

// Authentic brands verified in Musha Empire service catalog & salon data
const SALON_BRANDS = [
  {
    id: 'loreal',
    name: "L'Oréal Professionnel",
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center shrink-0">
        <span className="font-heading font-black tracking-[0.24em] text-[13px] sm:text-[14.5px] text-[#B88A45] leading-tight">
          L'ORÉAL
        </span>
        <span className="font-sans font-semibold tracking-[0.28em] text-[6.5px] sm:text-[7.5px] text-[#B88A45]/85 uppercase">
          PROFESSIONNEL PARIS
        </span>
      </div>
    )
  },
  {
    id: 'kerastase',
    name: 'Kérastase Paris',
    renderLogo: () => (
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-5 h-5 rounded-none border border-[#B88A45]/60 flex items-center justify-center text-[10px] font-serif font-bold text-[#B88A45]">
          K
        </div>
        <div className="flex flex-col">
          <span className="font-serif font-bold tracking-[0.22em] text-[13px] sm:text-[14px] text-[#B88A45] leading-tight">
            KÉRASTASE
          </span>
          <span className="font-sans font-medium tracking-[0.32em] text-[6.5px] sm:text-[7px] text-[#B88A45]/85 uppercase">
            PARIS
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'olaplex',
    name: 'Olaplex',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center shrink-0">
        <span className="font-sans font-extrabold tracking-[0.26em] text-[13px] sm:text-[14.5px] text-[#B88A45] leading-tight">
          OLAPLEX
        </span>
        <span className="font-sans font-medium tracking-[0.24em] text-[6.5px] sm:text-[7px] text-[#B88A45]/85 uppercase">
          BOND SCIENCE
        </span>
      </div>
    )
  },
  {
    id: 'schwarzkopf',
    name: 'Schwarzkopf Professional',
    renderLogo: () => (
      <div className="flex items-center gap-2 shrink-0">
        <svg className="w-4 h-4 text-[#B88A45] fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C8.5 2 6 4.5 6 8c0 2 .8 3.8 2.2 5.1L7 19h10l-1.2-5.9C17.2 11.8 18 10 18 8c0-3.5-2.5-6-6-6zm-1 3.5c1.8 0 3.2 1.4 3.2 3.2 0 1.2-.6 2.2-1.6 2.8l.4 2.5h-4l.4-2.5c-1-.6-1.6-1.6-1.6-2.8 0-1.8 1.4-3.2 3.2-3.2z" opacity="0.9" />
        </svg>
        <div className="flex flex-col">
          <span className="font-serif font-bold tracking-[0.14em] text-[12.5px] sm:text-[13.5px] text-[#B88A45] leading-tight">
            Schwarzkopf
          </span>
          <span className="font-sans font-semibold tracking-[0.26em] text-[6.5px] sm:text-[7px] text-[#B88A45]/85 uppercase">
            PROFESSIONAL
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'oribe',
    name: 'Oribe Hair Care',
    renderLogo: () => (
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-5 h-5 rounded-full border border-[#B88A45]/60 flex items-center justify-center text-[10px] font-serif italic text-[#B88A45]">
          O
        </div>
        <div className="flex flex-col">
          <span className="font-serif font-bold tracking-[0.26em] text-[13px] sm:text-[14.5px] text-[#B88A45] leading-tight">
            ORIBE
          </span>
          <span className="font-sans font-medium tracking-[0.28em] text-[6.5px] sm:text-[7px] text-[#B88A45]/85 uppercase">
            HAIR CARE
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'matrix',
    name: 'Matrix Professional',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center shrink-0">
        <span className="font-sans font-black tracking-[0.26em] text-[13px] sm:text-[14.5px] text-[#B88A45] leading-tight">
          MATRIX
        </span>
        <span className="font-sans font-semibold tracking-[0.28em] text-[6.5px] sm:text-[7px] text-[#B88A45]/85 uppercase">
          PROFESSIONAL
        </span>
      </div>
    )
  },
  {
    id: 'o3plus',
    name: 'O3+ Professional',
    renderLogo: () => (
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-baseline font-heading font-black text-[#B88A45] text-[13.5px] sm:text-[15px] tracking-tight">
          <span>O</span>
          <span className="text-[10px] font-bold">3</span>
          <span className="text-[#B88A45] text-[11px] ml-0.5 font-bold">+</span>
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-bold tracking-[0.22em] text-[9px] sm:text-[10px] text-[#B88A45] uppercase leading-none">
            PROFESSIONAL
          </span>
          <span className="font-sans font-medium tracking-[0.18em] text-[6.5px] text-[#B88A45]/70 uppercase">
            DERMO-CARE
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'streax',
    name: 'Streax Professional',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center shrink-0">
        <span className="font-heading font-bold lowercase tracking-[0.22em] text-[13px] sm:text-[14px] text-[#B88A45] leading-tight">
          streax
        </span>
        <span className="font-sans font-semibold tracking-[0.26em] text-[6.5px] sm:text-[7px] text-[#B88A45]/85 uppercase">
          PROFESSIONAL
        </span>
      </div>
    )
  }
];

export function SalonBrandsMarquee() {
  return (
    <section
      id="salon-brands-marquee"
      aria-label="Professional Salon & Cosmetic Formulations"
      className="w-full bg-[#FAF7F0] border-y border-[#E6DCCB] py-3 sm:py-3.5 relative overflow-hidden select-none marquee-track-container"
    >
      {/* Marquee Track (Double repeat for gapless infinite loop) */}
      <div className="animate-marquee-rtl flex items-center">
        {[...SALON_BRANDS, ...SALON_BRANDS].map((brand, index) => (
          <div key={`${brand.id}-${index}`} className="flex items-center shrink-0">
            <div
              className="hover:opacity-85 transition-opacity duration-300 py-1 cursor-default"
              title={brand.name}
            >
              {brand.renderLogo()}
            </div>
            <span
              className="text-[#B88A45]/40 text-[8px] sm:text-[9px] mx-5 sm:mx-8 select-none"
              aria-hidden="true"
            >
              ◆
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BrandBenefits() {
  const indicators = [
    {
      id: 'pillar-1',
      title: 'Certified Masters',
      tagline: 'Artisan Excellence',
      icon: <Award className="h-5 w-5 text-brand-secondary" />,
      description: 'Master stylists certified in Vidal Sassoon & haute couture techniques',
    },
    {
      id: 'pillar-2',
      title: 'Pure Botanicals',
      tagline: 'Clean Chemistry',
      icon: <Sparkles className="h-5 w-5 text-brand-secondary" />,
      description: 'Cruelty-free organic active elixirs with zero ammonia formulations',
    },
    {
      id: 'pillar-3',
      title: 'Private Suites',
      tagline: 'Sovereign Sanctuary',
      icon: <Users className="h-5 w-5 text-brand-secondary" />,
      description: 'Quiet, unhurried treatment suites with acoustic privacy',
    },
    {
      id: 'pillar-4',
      title: 'Bespoke Care',
      tagline: 'Personal Diagnostics',
      icon: <Star className="h-5 w-5 text-brand-secondary" />,
      description: 'Customized hair & scalp regimens tailored to your topology',
    }
  ];

  return (
    <section id="trust" className="py-12 sm:py-16 md:py-20 bg-brand-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {indicators.map((item, idx) => (
            <motion.div
              key={item.id}
              id={`trust-indicator-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col items-center text-center p-6 sm:p-7 lg:p-8 bg-white dark:bg-[#121212] hover:bg-[#FAF7F0] dark:hover:bg-[#161616] border border-[#E6DCCB] dark:border-brand-secondary/20 hover:border-brand-secondary/50 rounded-[18px] transition-all duration-300 shadow-[0_4px_20px_rgba(33,29,24,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)] h-full justify-between"
            >
              <div className="flex flex-col items-center w-full">
                {/* Outlined square icon frame */}
                <div className="w-12 h-12 flex items-center justify-center border border-[#E6DCCB] dark:border-brand-secondary/30 group-hover:border-brand-secondary/60 bg-[#FAF7F0] dark:bg-[#0B0B0B] group-hover:bg-[#F1E9DC] dark:group-hover:bg-brand-secondary/10 rounded-xl mb-5 transition-colors duration-300 shadow-sm shrink-0">
                  {item.icon}
                </div>

                {/* Heading */}
                <h3 className="text-lg sm:text-xl font-heading text-[#211D18] dark:text-white font-bold tracking-tight leading-snug">
                  {item.title}
                </h3>

                {/* Gold uppercase subtitle */}
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-secondary mt-1.5 block">
                  {item.tagline}
                </span>

                {/* Description */}
                <p className="font-sans text-xs sm:text-[13px] text-[#746B60] dark:text-neutral-300 mt-3 leading-relaxed font-normal max-w-[240px]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { BrandBenefits as TrustIndicators };
export default BrandBenefits;
