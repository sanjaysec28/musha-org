/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Patron Categories (Men, Women, Boys, Girls, Third Gender / Universal)
 * Matches the approved Bright Creamy Luxury visual language.
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Heart, Compass, Crown, ArrowRight } from 'lucide-react';

export interface PatronCategoryItem {
  id: 'Men' | 'Women' | 'Boy' | 'Girl' | 'Other';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  image: string;
}

export const PATRON_CATEGORIES: PatronCategoryItem[] = [
  {
    id: 'Men',
    title: "Men's Grooming",
    subtitle: 'Kings & Gentlemen',
    description: 'Precision scissor cuts, hot towel beard sculpting, charcoal facials, and hair spa treatments.',
    icon: Crown,
    tag: 'Executive Suites',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Women',
    title: "Women's Sanctuary",
    subtitle: 'Queens & Ladies',
    description: 'Balayage, couture blowouts, keratin silk baths, Korean glow facials, and bridal suites.',
    icon: Sparkles,
    tag: 'Haute Artistry',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Boy',
    title: "Boys' Styling",
    subtitle: 'Young Gentlemen',
    description: 'Unhurried scissor trims, modern fades, and gentle scalp-friendly botanical washes.',
    icon: Compass,
    tag: 'Youth Grooming',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Girl',
    title: "Girls' Styling",
    subtitle: 'Young Royalty',
    description: 'Gentle haircutting, botanical conditioning, celebratory braiding, and delicate trims.',
    icon: Heart,
    tag: 'Delicate Care',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Other',
    title: 'Universal Experience',
    subtitle: 'Inclusive Atelier & Third Gender',
    description: 'Bespoke scalp diagnosis, gender-affirming styling, and private treatment suites for every guest.',
    icon: Shield,
    tag: 'All Welcome',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
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
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3.5">
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

        {/* 5-Column Responsive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {PATRON_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                id={`patron-cat-card-${cat.id.toLowerCase()}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                onClick={() => onSelectCategory?.(cat.id)}
                className="group relative flex flex-col justify-between bg-white border border-[#E6DCCB] hover:border-[#B88A45]/60 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-400 shadow-sm hover:shadow-xl hover:shadow-[#B88A45]/10 cursor-pointer hover:-translate-y-1 text-left"
              >
                {/* 1. High-Quality Editorial Image Banner */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1E9DC]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 motion-reduce:transform-none"
                  />
                  {/* Subtle tonal gradient to ground badge and elevate luxury feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none" />

                  {/* Floating Category Tag with Icon */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#E6DCCB] text-[#B88A45] shadow-xs">
                    <Icon className="w-3.5 h-3.5 text-[#B88A45]" />
                    <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-[#211D18]">
                      {cat.tag}
                    </span>
                  </div>
                </div>

                {/* 2. Card Content Body */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4 bg-white">
                  <div>
                    <span className="font-mono text-[9px] sm:text-[10px] text-[#B88A45] uppercase tracking-widest font-semibold block mb-1">
                      {cat.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#211D18] group-hover:text-[#B88A45] transition-colors leading-snug">
                      {cat.title}
                    </h3>
                    <p className="font-sans text-xs text-[#746B60] mt-2 leading-relaxed font-normal">
                      {cat.description}
                    </p>
                  </div>

                  {/* 3. Footer Action Button */}
                  <div className="pt-3.5 border-t border-[#E6DCCB] flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider text-[#B88A45] group-hover:text-[#211D18] transition-colors">
                    <span>Explore Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5 text-[#B88A45]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
