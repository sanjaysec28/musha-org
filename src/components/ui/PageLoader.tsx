/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import MushaEmpireLogo from './MushaEmpireLogo';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const dismissLoader = () => {
      setLoading(false);
    };

    // Fast-path: Dismiss after short elegant branding transition window (max 1000ms)
    if (document.readyState === 'complete') {
      timer = setTimeout(dismissLoader, 750);
    } else {
      window.addEventListener('load', dismissLoader, { once: true });
      timer = setTimeout(dismissLoader, 1100);
    }

    // Fail-safe listeners: never trap user on loading screen if error occurs
    const handleError = () => setLoading(false);
    window.addEventListener('error', handleError, { once: true });
    window.addEventListener('unhandledrejection', handleError, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', dismissLoader);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          id="global-page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 bg-[#0B0B0B] z-50 flex flex-col items-center justify-center text-center p-6 selection:bg-brand-secondary/35"
        >
          {/* Centered Official Logo Frame */}
          <div className="space-y-6 mb-6 relative select-none max-w-xs sm:max-w-sm flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <MushaEmpireLogo variant="vertical" classNameLogo="max-h-44 sm:max-h-52 md:max-h-56 w-auto" />
            </motion.div>
          </div>

          {/* Subtle Champagne-Gold Loading Indicator */}
          <div className="relative h-7 w-7 flex items-center justify-center mt-2">
            <div className="absolute inset-0 rounded-full border border-brand-secondary/15" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-t-2 border-brand-secondary"
            />
          </div>

          {/* Refined Brand Subtitle */}
          <span className="font-heading text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-brand-secondary/60 mt-4 select-none">
            Style For Everyone
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
