/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Instagram, Facebook, Mail, CheckCircle, MapPin, Phone } from 'lucide-react';
import { settingsRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings } from '../../types/firestore';
import Button from '../ui/Button';
import MushaEmpireLogo from '../ui/MushaEmpireLogo';
import { SALON_CONTACT } from '../../data/salonContact';

export interface FooterProps {
  onNavigate?: (view: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404') => void;
}

export default function Footer({ onNavigate }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((s) => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in Footer:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const serviceColumns = [
    {
      title: 'Gentlemen',
      links: [
        { label: 'Royal Grooming & Cuts', href: '#gentlemen' },
        { label: 'Beard Sculpting & Oils', href: '#gentlemen' },
        { label: 'Scalp & Hair Spa Therapies', href: '#gentlemen' },
        { label: 'Premium Charcoal Facials', href: '#gentlemen' },
      ],
    },
    {
      title: 'Ladies',
      links: [
        { label: 'Hairstyling & Blowouts', href: '#ladies' },
        { label: 'Balayage, Tinting & Highlights', href: '#ladies' },
        { label: 'Keratin Nourish Infusion', href: '#ladies' },
        { label: 'Signature Spa Manicure', href: '#ladies' },
      ],
    },
    {
      title: 'Empire Suite',
      links: [
        { label: 'Pre-Wedding Consultation', href: '#wedding' },
        { label: 'VIP Executive Styling Cabin', href: '#vip' },
        { label: 'Aromatherapy Steam Sauna', href: '#spa' },
        { label: 'Therapeutic Hot Stone Massage', href: '#spa' },
      ],
    },
  ];

  return (
    <footer id="main-footer" className="bg-[#FAF7F0] text-[#211D18] pt-20 pb-28 lg:pb-16 border-t border-[#E6DCCB] relative">
      <div id="footer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Branding & Subscription Block */}
        <div id="footer-top-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#E6DCCB]">
          {/* Logo & Philosophy */}
          <div id="footer-brand-column" className="lg:col-span-5 space-y-6">
            <div id="footer-brand-logo" className="flex flex-col select-none items-start">
              <MushaEmpireLogo variant="horizontal" />
            </div>
            <p id="footer-philosophy" className="font-sans text-xs md:text-sm text-[#746B60] max-w-sm leading-relaxed font-normal">
              We define hair artistry and holistic aesthetic care. Bringing Scandinavian minimalist luxury and elite craftsmanship together under one crown. Dedicated to absolute safety, premium eco-conscious botanical elixirs, and bespoke salon rituals.
            </p>
            <div id="footer-socials" className="flex items-center space-x-4">
              <a
                id="footer-social-ig"
                href={SALON_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 border border-[#E6DCCB] hover:border-brand-secondary text-brand-secondary hover:text-[#211D18] rounded-xl flex items-center justify-center transition-all duration-300 bg-white hover:bg-[#F1E9DC] shadow-[0_2px_8px_rgba(33,29,24,0.04)] hover:shadow-sm"
                aria-label="Follow Musha Empire Unisex Saloon on Instagram"
              >
                <Instagram className="h-4.5 w-4.5 stroke-[1.5] text-brand-secondary" />
              </a>
              <a
                id="footer-social-fb"
                href="#facebook"
                className="h-10 w-10 border border-[#E6DCCB] hover:border-brand-secondary text-brand-secondary hover:text-[#211D18] rounded-xl flex items-center justify-center transition-all duration-300 bg-white hover:bg-[#F1E9DC] shadow-[0_2px_8px_rgba(33,29,24,0.04)] hover:shadow-sm"
                aria-label="Follow Musha on Facebook"
              >
                <Facebook className="h-4.5 w-4.5 stroke-[1.5] text-brand-secondary" />
              </a>
            </div>
          </div>

          {/* Subscription Box - Bright Warm Ivory & Soft Cream Luxury Palette */}
          <div id="footer-newsletter-column" className="lg:col-span-7 bg-[#F1E9DC] border border-[#E6DCCB] p-8 md:p-10 flex flex-col justify-between shadow-[0_4px_20px_rgba(33,29,24,0.04)] relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#B88A45_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div id="newsletter-header" className="space-y-2 relative z-10">
              <p id="newsletter-tag" className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-secondary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-secondary stroke-[1.5]" /> The Royal Dispatch
              </p>
              <h3 id="newsletter-title" className="font-serif text-xl md:text-2xl text-[#211D18] font-bold leading-snug">
                Join our premium roster for member-only invites, priority bookings, and bespoke seasonal beauty updates.
              </h3>
            </div>

            <div id="newsletter-form-container" className="mt-8 relative z-10">
              {isSubscribed ? (
                <div id="newsletter-success" className="p-4 border border-brand-secondary/35 bg-white text-brand-secondary flex items-center gap-3 rounded-xl shadow-sm">
                  <CheckCircle className="h-5 w-5 text-brand-secondary shrink-0" />
                  <p className="font-sans text-xs tracking-wider uppercase font-medium text-[#211D18]">
                    Thank you. Your premium privilege invitation has been dispatched to <span className="text-brand-secondary font-mono font-bold">{email}</span>.
                  </p>
                </div>
              ) : (
                <form
                  id="newsletter-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) {
                      setIsSubscribed(true);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div id="newsletter-input-wrapper" className="relative flex-1">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-secondary/70">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#E6DCCB] text-[#211D18] font-sans text-xs uppercase tracking-wider placeholder:text-[#746B60]/70 py-3.5 pl-11 pr-4 rounded-xl outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all shadow-sm"
                    />
                  </div>
                  <Button
                    id="newsletter-submit"
                    type="submit"
                    variant="primary"
                    size="md"
                    className="shrink-0 uppercase font-bold tracking-widest text-xs px-8 rounded-xl bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18] transition-all duration-300"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
              <p id="newsletter-disclaimer" className="text-[10px] text-[#746B60] font-sans mt-3 leading-relaxed">
                Respecting your sanctuary. No unsolicited mailings or external database sharing. Unsubscribe at any turn.
              </p>
            </div>
          </div>
        </div>

        {/* Links Directories */}
        <div id="footer-links-grid" className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-sm">
          {serviceColumns.map((col) => (
            <div key={col.title} id={`footer-links-col-${col.title.toLowerCase()}`} className="space-y-4">
              <h4 className="font-heading text-xs uppercase tracking-[0.18em] font-bold text-brand-secondary mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 font-sans text-xs">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[#746B60] hover:text-brand-secondary transition-colors inline-block py-1 hover:translate-x-0.5 duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Details */}
          <div id="footer-contact-column" className="space-y-4 col-span-2 md:col-span-1">
            <h4 className="font-heading text-xs uppercase tracking-[0.18em] font-bold text-brand-secondary mb-4">
              Salon Concierge
            </h4>
            <div className="space-y-3 font-sans text-xs text-[#746B60]">
              <div>
                <p className="font-heading font-bold text-[#211D18] leading-tight">
                  {SALON_CONTACT.businessName}
                </p>
                <a
                  id="footer-maps-link"
                  href={SALON_CONTACT.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-brand-secondary hover:text-[#211D18] hover:underline underline-offset-4 mt-1.5 group font-medium transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-secondary" />
                  <span>Open Google Maps &rarr;</span>
                </a>
              </div>
              <p className="space-y-1">
                <span className="block font-medium text-[#211D18]">Reservations Desk:</span>
                <a
                  id="footer-phone-link"
                  href={SALON_CONTACT.phoneTel}
                  className="text-[#746B60] hover:text-brand-secondary transition-colors hover:underline decoration-brand-secondary/35 underline-offset-4 inline-flex items-center gap-1.5"
                >
                  <Phone className="h-3 w-3 shrink-0 text-brand-secondary" />
                  <span>{SALON_CONTACT.phoneDisplay}</span>
                </a>
              </p>
              <p className="space-y-1">
                <span className="block font-medium text-[#211D18]">Concierge Mail:</span>
                <a
                  id="footer-email-link"
                  href={SALON_CONTACT.emailMailto}
                  className="text-[#746B60] hover:text-brand-secondary transition-colors hover:underline decoration-brand-secondary/35 underline-offset-4 inline-flex items-center gap-1.5 break-all"
                >
                  <Mail className="h-3 w-3 shrink-0 text-brand-secondary" />
                  <span>{SALON_CONTACT.email}</span>
                </a>
              </p>
              <p className="space-y-1 pt-0.5">
                <span className="block font-medium text-[#211D18]">Instagram:</span>
                <a
                  id="footer-instagram-link"
                  href={SALON_CONTACT.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#746B60] hover:text-brand-secondary transition-colors hover:underline decoration-brand-secondary/35 underline-offset-4 inline-flex items-center gap-1.5"
                >
                  <Instagram className="h-3 w-3 shrink-0 text-brand-secondary" />
                  <span>{SALON_CONTACT.instagramHandle}</span>
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal line */}
        <div id="footer-bottom-flex" className="pt-10 border-t border-[#E6DCCB] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#746B60] font-sans">
          <p id="footer-copyright" className="leading-relaxed">
            &copy; {currentYear} {SALON_CONTACT.businessName}.<br />
            Luxury Unisex Salon & Spa.<br />
            All Rights Reserved.
          </p>
          <div id="footer-legal-links" className="flex items-center space-x-6">
            <button
              id="footer-privacy-btn"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('privacy');
              }}
              className="text-[#746B60] hover:text-brand-secondary transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              id="footer-terms-btn"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('terms');
              }}
              className="text-[#746B60] hover:text-brand-secondary transition-colors cursor-pointer"
            >
              Terms of Attendance
            </button>
            <button
              id="footer-refund-btn"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('refund');
              }}
              className="text-[#746B60] hover:text-brand-secondary transition-colors cursor-pointer"
            >
              Cancellation Guarantee
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
