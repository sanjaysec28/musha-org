/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

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

/**
 * Note: The four-card benefits section has been permanently removed per design directive.
 */
export function BrandBenefits() {
  return null;
}

export { BrandBenefits as TrustIndicators };
export default BrandBenefits;
