/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Sovereign Patron Grooming Categories
 * 16:9 Landscape cards featuring approved bespoke imagery.
 */

import React from 'react';
import { motion } from 'motion/react';

export interface PatronCategoryItem {
  id: 'Men' | 'Women' | 'Boy' | 'Girl' | 'Other';
  title: string;
  image: string;
  ariaLabel: string;
}

export const PATRON_CATEGORIES: PatronCategoryItem[] = [
  {
    id: 'Men',
    title: "Men's Grooming",
    ariaLabel: "Men's Grooming — View Men's Services",
    image: '/images/men-groom.png',
  },
  {
    id: 'Women',
    title: "Women's Grooming",
    ariaLabel: "Women's Grooming — View Women's Services",
    image: '/images/women-groom.png',
  },
  {
    id: 'Boy',
    title: "Boys' Grooming",
    ariaLabel: "Boys' Grooming — View Boys' Services",
    image: '/images/boys-groom.png',
  },
  {
    id: 'Girl',
    title: "Girls' Grooming",
    ariaLabel: "Girls' Grooming — View Girls' Services",
    image: '/images/girls-groom.png',
  },
  {
    id: 'Other',
    title: 'Universal Grooming (Inclusive Atelier & Third Gender)',
    ariaLabel: 'Universal Grooming Services & Third Gender Inclusive Atelier — View Universal Services',
    image: '/images/universal-groom.png',
  },
];

export interface PatronCategoriesProps {
  onSelectCategory?: (categoryId: string) => void;
}

export default function PatronCategories({ onSelectCategory }: PatronCategoriesProps) {
  return (
    <section id="patron-categories" className="py-16 sm:py-20 md:py-24 bg-[#FAF7F0] border-y border-[#E6DCCB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3.5">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-[#B88A45] block">
            INDIVIDUALIZED LUXURY CARE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#211D18] leading-tight">
            Curated For <span className="font-serif-italic text-[#B88A45]">Every Sovereign Patron</span>
          </h2>
          <div className="luxury-divider max-w-xs mx-auto" />
          <p className="font-sans text-xs md:text-sm text-[#746B60] leading-relaxed font-normal max-w-2xl mx-auto">
            Choose your signature suite. Our certified master artists provide bespoke care tailored to every age, topology, and stylistic preference.
          </p>
        </div>

        {/* 5-Column Responsive Cards Grid (Desktop: 5 in one row, Tablet: 2 per row, Mobile: 1-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-5">
          {PATRON_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className={`w-full flex flex-col ${
                idx === 4 ? 'sm:col-span-2 lg:col-span-1 sm:max-w-[calc(50%-0.625rem)] sm:mx-auto lg:max-w-none' : ''
              }`}
            >
              <button
                id={`patron-cat-card-${cat.id.toLowerCase()}`}
                type="button"
                onClick={() => onSelectCategory?.(cat.id)}
                aria-label={cat.ariaLabel}
                className="group relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#B88A45]/35 hover:border-[#B88A45] bg-[#161412] shadow-sm hover:shadow-xl hover:shadow-[#B88A45]/20 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F0] cursor-pointer block p-0 text-left"
                style={{ aspectRatio: '16 / 9' }}
              >
                <img
                  src={cat.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none block"
                  style={{ aspectRatio: '16 / 9' }}
                />
                <span className="sr-only">{cat.ariaLabel}</span>
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
