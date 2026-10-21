/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Premium Luxury Page Loader
 * 
 * Design System: Bright Creamy Luxury
 * - Background: Warm Ivory (#FAF7F0)
 * - Glow: Subtle blurred Champagne-Gold (#B88A45)
 * - Spinner: Smooth, thin circular gold spinner (#B88A45)
 * - Branding: Official transparent brand logo with graceful "MUSHA EMPIRE" fallback
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface PageLoaderProps {
  /**
   * Optional loading state from parent (e.g. auth / initial data loading).
   * When true, keeps loader visible; when false, triggers smooth transition.
   */
  isLoading?: boolean;
}

export default function PageLoader({ isLoading }: PageLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout>;

    const dismissLoader = () => {
      // Gentle settling window to prevent abrupt micro-flickering
      dismissTimer = setTimeout(() => {
        setVisible(false);
      }, 180);
    };

    if (isLoading === false) {
      // App genuinely finished loading
      dismissLoader();
    } else if (isLoading === undefined) {
      // Standalone mode: dismiss when document ready state is complete
      if (document.readyState === 'complete') {
        dismissLoader();
      } else {
        window.addEventListener('load', dismissLoader, { once: true });
      }
    }

    // Fail-safe max timeout (never trap the user on loading screen)
    const maxSafetyTimer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    // Fail-safe listeners for uncaught errors
    const handleError = () => setVisible(false);
    window.addEventListener('error', handleError, { once: true });
    window.addEventListener('unhandledrejection', handleError, { once: true });

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(maxSafetyTimer);
      window.removeEventListener('load', dismissLoader);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="global-page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#FAF7F0] overflow-hidden select-none"
          role="status"
          aria-live="polite"
          aria-label="Loading Musha Empire Luxury Unisex Salon & Spa"
        >
          {/* Subtle Blurred Champagne-Gold Glow */}
          <div
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#B88A45]/[0.09] blur-[85px] pointer-events-none -translate-y-4"
            aria-hidden="true"
          />

          {/* Centered Luxury Brand Presentation */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center text-center max-w-xs sm:max-w-sm"
          >
            {/* Transparent Brand Logo or Elegant Typographic Fallback */}
            {!logoFailed ? (
              <img
                src="/images/musha_empire_official_logo.png"
                alt="Musha Empire"
                onError={() => setLogoFailed(true)}
                className="h-16 sm:h-20 md:h-22 w-auto object-contain max-w-[260px] sm:max-w-[300px]"
                loading="eager"
              />
            ) : (
              <div className="flex flex-col items-center text-center space-y-1">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-[#211D18]">
                  MUSHA EMPIRE
                </span>
                <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.35em] text-[#B88A45]">
                  Luxury Unisex Salon &amp; Spa
                </span>
              </div>
            )}

            {/* Smooth, Thin Circular Gold Spinner */}
            <div
              className="relative w-8 h-8 flex items-center justify-center mt-6"
              aria-hidden="true"
            >
              {/* Delicate background track */}
              <div className="absolute inset-0 rounded-full border border-[#B88A45]/20" />
              {/* Smooth rotating thin gold arc */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-t border-[#B88A45]"
              />
            </div>

            {/* Refined Brand Subtitle */}
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#746B60] mt-3.5">
              Style For Everyone
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
