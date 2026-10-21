/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function NewsletterSection({
  triggerToast,
}: {
  triggerToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');

      if (triggerToast) {
        triggerToast(
          'success',
          'Privilege Registration Confirmed!',
          'Your signature email has been enrolled on the Musha Dispatch roster.'
        );
      }
    }, 1500);
  };

  return (
    <section
      id="newsletter-curation-banner"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-4 mb-16 sm:mb-20"
    >
      <div className="bg-[#F1E9DC] border border-[#E6DCCB] text-[#211D18] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-sm rounded-2xl">
        {/* Decorative background grid and vector gradients - subtle warm gold */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#B88A45_1px,transparent_1px),linear-gradient(to_bottom,#B88A45_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            The Royal Dispatch
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#211D18] font-bold tracking-tight max-w-2xl mx-auto leading-tight">
            Acquire <span className="font-serif-italic text-brand-secondary italic font-bold">Privilege Updates</span>
          </h2>
          <div className="luxury-divider max-w-xs mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-[#746B60] max-w-xl mx-auto leading-relaxed">
            Join our private newsletter roster to receive early invites to seasonal botanical therapy releases, member-only standby notifications, and priority bookings with visiting master directors.
          </p>

          <AnimatePresence mode="wait">
            {!isSubscribed ? (
              <motion.form
                key="subscription-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubscribe}
                className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-4"
              >
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-secondary/70">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="newsletter-section-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white border border-[#E6DCCB] text-[#211D18] font-sans text-xs uppercase tracking-wider placeholder:text-[#746B60]/70 py-3.5 pl-11 pr-4 rounded-xl outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all shadow-inner"
                  />
                </div>
                <Button
                  id="newsletter-section-submit"
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  className="uppercase shrink-0 rounded-xl bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18] font-bold tracking-wider px-6"
                >
                  Subscribe
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="subscription-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 border border-brand-secondary/35 p-6 max-w-md mx-auto text-center space-y-2 rounded-xl shadow-sm"
              >
                <CheckCircle2 className="h-8 w-8 text-brand-secondary mx-auto mb-2" />
                <h4 className="font-serif text-lg text-[#211D18] font-bold">Privilege Card Enrolled!</h4>
                <p className="font-sans text-xs text-[#746B60] leading-relaxed">
                  Thank you. Your personal invitation to explore upcoming custom botanicals is being compiled and will arrive in your inbox shortly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="font-sans text-[10px] text-[#746B60]">
            Zero noise guarantee. Unsubscribe easily at any time. We respect your sanctuary.
          </p>
        </div>
      </div>
    </section>
  );
}
