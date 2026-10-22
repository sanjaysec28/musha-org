/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Calendar, ArrowRight, Award } from 'lucide-react';
const HERO_IMAGE_SRC = '/images/musha_luxury_salon_interior.png';

export interface HeroProps {
  onBookClick?: () => void;
  onExploreClick?: () => void;
}

export default function Hero({ onBookClick, onExploreClick }: HeroProps) {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onPrimaryClick = () => {
    if (onBookClick) {
      onBookClick();
    } else {
      handleScrollTo('booking');
    }
  };

  const onSecondaryClick = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      handleScrollTo('services');
    }
  };

  return (
    <section
      id="hero"
      className="relative flex flex-col md:flex-row md:min-h-screen lg:min-h-[850px] bg-[#FAF7F0] text-[#211D18] overflow-hidden pt-[76px] sm:pt-[84px] md:pt-0"
    >
      {/* ----------------- MOBILE HERO IMAGE (ONLY ON MOBILE <= 767px) ----------------- */}
      <div className="block md:hidden relative w-full h-[30vh] min-h-[210px] max-h-[280px] overflow-hidden bg-[#FAF7F0]">
        {/* Subtle decorative gold inner frame */}
        <div className="absolute inset-3 border border-brand-secondary/20 z-10 pointer-events-none rounded-sm" />
        
        {/* Seamless subtle cream gradient transition at the bottom of the image (replaces all dark strips) */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FAF7F0] via-[#FAF7F0]/40 to-transparent z-10 pointer-events-none" />

        {/* Bright Unisex Salon Interior Photography */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src={HERO_IMAGE_SRC}
            alt="Musha Empire Luxury Salon Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center sm:object-[center_35%]"
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* ----------------- EDITORIAL CONTENT (LEFT ON DESKTOP/TABLET, BELOW ON MOBILE) ----------------- */}
      <div className="w-full md:w-[50%] lg:w-[48%] xl:w-[42%] flex flex-col justify-start md:justify-center px-4 sm:px-8 md:px-8 lg:px-12 xl:px-20 pt-4 sm:pt-6 pb-24 md:pt-24 md:pb-16 lg:pt-[88px] lg:pb-12 relative z-20 bg-[#FAF7F0]">
        <div className="max-w-xl mx-auto lg:mx-0 text-center md:text-left relative z-20">
          
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-brand-secondary text-[10px] sm:text-xs uppercase tracking-[0.24em] sm:tracking-[0.28em] font-sans font-bold justify-center md:justify-start mb-2 sm:mb-2.5"
          >
            <span className="h-1.5 w-1.5 rounded-none bg-brand-secondary animate-pulse" />
            The Sanctuary of Sovereign Artistry
          </motion.div>

          {/* Headline - Modern Editorial Manrope with Balanced Wrapping */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 text-3xl sm:text-4xl md:text-[2.6rem] lg:text-[3.15rem] xl:text-[3.65rem] font-serif font-bold tracking-tight leading-[1.14] text-[#211D18] max-w-lg lg:max-w-xl mx-auto md:mx-0 overflow-visible mb-3 sm:mb-3.5"
          >
            Where Heritage Meets <br className="hidden sm:inline" />
            <span className="text-gold-gradient font-bold italic inline-block pr-1.5">Avant-Garde</span>{' '}
            <span className="relative z-20 inline-block">Styling</span>
          </motion.h1>

          {/* Supporting Paragraph - Authentic, Neutral Luxury Tone */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-xs sm:text-sm text-[#746B60] leading-relaxed font-normal max-w-md mx-auto md:mx-0 mb-5 sm:mb-6"
          >
            Welcome to the Musha Empire. We harmonize meticulous craftsmanship with bespoke styling and pure botanical care. Step into a quiet, unhurried sanctuary tailored for an elevated unisex salon experience.
          </motion.p>

          {/* Action Buttons (Dominant Primary Booking + Quieter Secondary Explore) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mb-6 sm:mb-7"
          >
            {/* Mobile View Buttons: Rounded & Stacked */}
            <div className="flex md:hidden flex-col gap-3 w-full">
              <button
                id="hero-book-cta-mobile"
                onClick={onPrimaryClick}
                className="w-full h-[50px] bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18] font-sans font-bold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer rounded-[12px] border border-transparent shadow-[0_4px_16px_rgba(184,138,69,0.22)]"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Reserve Experience</span>
              </button>
              <button
                id="hero-explore-cta-mobile"
                onClick={onSecondaryClick}
                className="w-full h-[50px] bg-transparent text-[#746B60] hover:text-[#211D18] border border-[#E6DCCB] hover:border-brand-secondary/60 font-sans font-semibold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer rounded-[12px]"
              >
                <span>Explore Services</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>

            {/* Tablet & Desktop View Buttons: Inline, Recognizable Hierarchy */}
            <div className="hidden md:flex flex-row gap-3.5 w-full">
              <button
                id="hero-book-cta-desktop"
                onClick={onPrimaryClick}
                className="flex-1 h-[52px] px-6 bg-brand-secondary text-[#211D18] font-sans font-bold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#D5B890] hover:shadow-[0_4px_20px_rgba(184,138,69,0.3)] active:scale-[0.99] cursor-pointer rounded-none border border-transparent"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Reserve Experience</span>
              </button>
              <button
                id="hero-explore-cta-desktop"
                onClick={onSecondaryClick}
                className="flex-1 h-[52px] px-6 bg-transparent text-[#211D18]/85 border border-[#E6DCCB] hover:text-brand-secondary hover:border-brand-secondary font-sans font-semibold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-brand-secondary/5 active:scale-[0.99] cursor-pointer rounded-none"
              >
                <span>Explore Services</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </motion.div>

          {/* Brand Hallmarks (Aligned Columns, Authentic Editorial Facts) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="pt-5 sm:pt-6 border-t border-[#E6DCCB] max-w-xl mx-auto md:mx-0"
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center md:text-left">
              <div className="space-y-1">
                <div className="font-serif text-sm sm:text-base lg:text-lg text-brand-secondary font-bold leading-tight">
                  Bespoke Artistry
                </div>
                <div className="font-sans text-[8.5px] sm:text-[9.5px] text-[#746B60] uppercase tracking-wider font-semibold leading-relaxed">
                  Tailored Styling
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-sm sm:text-base lg:text-lg text-brand-secondary font-bold leading-tight">
                  Pure Botanicals
                </div>
                <div className="font-sans text-[8.5px] sm:text-[9.5px] text-[#746B60] uppercase tracking-wider font-semibold leading-relaxed">
                  Clean Formulations
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-sm sm:text-base lg:text-lg text-brand-secondary font-bold leading-tight">
                  Private Suites
                </div>
                <div className="font-sans text-[8.5px] sm:text-[9.5px] text-[#746B60] uppercase tracking-wider font-semibold leading-relaxed">
                  Unhurried Sanctuary
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ----------------- TABLET & DESKTOP HERO IMAGE (HIDDEN ON MOBILE <= 767px) ----------------- */}
      <div className="hidden md:flex w-[50%] lg:w-[52%] xl:w-[58%] relative self-stretch overflow-hidden bg-[#FAF7F0] items-center justify-center">
        
        {/* Subtle decorative gold frame inside the image section */}
        <div className="absolute inset-6 xl:inset-8 border border-brand-secondary/15 z-20 pointer-events-none hidden lg:block" />
        
        {/* Seamless subtle cream gradient feathering at the inner image edge (no harsh black divider) */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-20 lg:w-28 bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0]/40 to-transparent z-15 pointer-events-none" />

        {/* Subtle cream bottom fade towards the marquee section */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#FAF7F0] to-transparent z-15 pointer-events-none" />
        
        {/* Slowly Panning Background Image - Bright Unisex Salon Interior */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src={HERO_IMAGE_SRC}
            alt="Musha Empire Luxury Unisex Salon Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center lg:object-[center_35%]"
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Floating Card 1: Unisex Atelier (Subordinate, Authentic & Non-colliding) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-10 left-8 z-25 bg-white/95 backdrop-blur-md border border-[#E6DCCB] p-5 rounded-2xl shadow-[0_8px_30px_rgb(33,29,24,0.08)] max-w-[270px] hidden xl:block text-left"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="font-sans text-[9.5px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-1.5 flex items-center gap-1.5">
              <span className="h-1 w-1 bg-brand-secondary" />
              UNISEX ATELIER
            </div>
            <p className="font-serif text-sm text-[#211D18] font-normal leading-snug">
              Dedicated styling stations and private treatment suites for unhurried comfort.
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Card 2: Consultation Protocol - positioned below 88px navbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-28 right-8 z-25 bg-white/95 backdrop-blur-md border border-[#E6DCCB] p-5 rounded-2xl shadow-[0_8px_30px_rgb(33,29,24,0.08)] max-w-[230px] hidden xl:block text-left"
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="font-sans text-[9.5px] text-brand-secondary uppercase tracking-[0.2em] font-bold mb-1.5 flex items-center gap-1.5">
              <span className="h-1 w-1 bg-brand-secondary" />
              CONSULTATION FIRST
            </div>
            <p className="font-serif text-sm text-[#211D18] font-normal leading-snug">
              Personalized hair and scalp analysis tailored to your individual style.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
