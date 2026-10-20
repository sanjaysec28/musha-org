/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Phone, Mail, Clock, MessageSquare, Send, Instagram, Facebook, AlertCircle, CheckCircle } from 'lucide-react';
import { settingsRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings } from '../../types/firestore';
import Button from '../ui/Button';
import { SALON_CONTACT } from '../../data/salonContact';

export default function ContactPage({
  triggerToast,
}: {
  triggerToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Consultation Request',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((settings) => {
      if (isMounted && settings) {
        setSalonSettings(settings);
      }
    }).catch(err => {
      console.warn('Notice reading salon settings from Firestore:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const phoneDisplay = salonSettings?.phone || SALON_CONTACT.phoneDisplay;
  const emailDisplay = salonSettings?.email || SALON_CONTACT.email;
  const hasAddress = Boolean(salonSettings?.address);
  const addressLine1 = typeof salonSettings?.address === 'object'
    ? `${salonSettings.address.line1}${salonSettings.address.line2 ? `, ${salonSettings.address.line2}` : ''}`
    : (salonSettings?.address || SALON_CONTACT.businessName);
  const addressLine2 = typeof salonSettings?.address === 'object'
    ? `${salonSettings.address.city || ''}, ${salonSettings.address.state || ''} ${salonSettings.address.zipCode || ''}`.trim()
    : (hasAddress ? '' : 'Google Maps Navigation');

  const contactDetails = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: 'Salon Location',
      line1: SALON_CONTACT.businessName,
      line2: hasAddress ? `${addressLine1} ${addressLine2}`.trim() : 'View live map directions',
      link: SALON_CONTACT.googleMaps,
      linkLabel: 'Open Google Maps',
      isExternal: true,
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Reservations Desk',
      line1: phoneDisplay,
      line2: `Direct: ${SALON_CONTACT.phone}`,
      link: SALON_CONTACT.phoneTel,
      linkLabel: 'Call Reservation Desk',
      isExternal: false,
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: 'Concierge Mailbox',
      line1: emailDisplay,
      line2: 'Priority Response Desk',
      link: SALON_CONTACT.emailMailto,
      linkLabel: 'Email Concierge Desk',
      isExternal: false,
    },
  ];

  const hoursList = (Array.isArray(salonSettings?.opening_hours) && salonSettings.opening_hours.length > 0)
    ? salonSettings.opening_hours
    : (Array.isArray(salonSettings?.openingHours) && salonSettings.openingHours.length > 0)
    ? salonSettings.openingHours
    : null;

  const workingHours = hoursList && hoursList.length > 0
    ? hoursList.map(h => ({
        day: h.day,
        hours: h.isClosed ? 'Closed' : `${h.open} - ${h.close}`
      }))
    : [{ day: 'Operating Schedule', hours: 'Hours unavailable' }];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate backend submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Consultation Request',
        message: '',
      });

      if (triggerToast) {
        triggerToast(
          'success',
          'Inquiry Submitted',
          'Thank you. Our luxury concierge desk will contact you within 2 business hours.'
        );
      }
    }, 1800);
  };

  return (
    <div id="contact-page-wrapper" className="pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section id="contact-header" className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          Concierge Services
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-bold tracking-tight">
          Establish <span className="font-serif-italic text-brand-gold-dark italic">Connection</span>
        </h1>
        <div className="luxury-divider my-6" />
        <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
          Whether you require a bespoke wedding style outline, custom scalp recovery diagnostics, or priority VIP room lockouts, our concierge team is at your absolute disposal.
        </p>
      </section>

      {/* Grid: Details & Form */}
      <div id="contact-content-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Side: Info & Hours */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Card Blocks */}
          <div id="contact-blocks-list" className="space-y-6">
            {contactDetails.map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-brand-surface border border-brand-accent/20 flex gap-4 hover:border-brand-secondary/40 transition-all duration-300"
              >
                <div className="h-10 w-10 border border-brand-accent/20 text-brand-secondary flex items-center justify-center bg-brand-bg shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1 font-sans">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
                    {item.title}
                  </h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    {item.line1}
                    <br />
                    {item.line2}
                  </p>
                  <a
                    href={item.link}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-block text-[10px] text-brand-gold-dark font-semibold hover:underline underline-offset-4 uppercase tracking-wider pt-1.5"
                  >
                    {item.linkLabel} &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Working Hours Frame */}
          <div id="contact-working-hours" className="bg-brand-surface border border-brand-accent/25 p-6 md:p-8">
            <h3 className="font-serif text-xl text-brand-primary font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-secondary" /> Sanctuary Operating Hours
            </h3>
            <div className="luxury-divider mb-4" />
            <div className="space-y-3 font-sans text-xs">
              {workingHours.map((wh) => (
                <div key={wh.day} className="flex justify-between items-center text-brand-text-muted border-b border-brand-accent/10 pb-2">
                  <span className="font-semibold text-brand-primary">{wh.day}</span>
                  <span>{wh.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp CTA & Social Card */}
          <div id="whatsapp-direct-card" className="bg-brand-surface border border-brand-secondary/15 p-6 md:p-8 text-brand-text space-y-4">
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-brand-secondary font-semibold block">
              Direct WhatsApp & Social Concierge
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-primary">
              Need Instant Answers?
            </h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
              Skip the queue entirely. Chat directly with our private lounge concierge live regarding walk-in availability or master therapist standby schedules.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <a
                id="contact-whatsapp-link"
                href={SALON_CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center inline-flex justify-center items-center gap-2 bg-[#25D366] text-white font-sans text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-opacity-90 transition-all duration-300"
              >
                <MessageSquare className="h-4 w-4 fill-white text-transparent" /> Message WhatsApp Desk
              </a>
              
              {/* Social Directory Links */}
              <div className="flex items-center gap-3">
                <a
                  id="contact-instagram-link"
                  href={SALON_CONTACT.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 border border-brand-secondary/30 hover:border-brand-secondary hover:text-brand-secondary rounded-none flex items-center justify-center text-brand-secondary transition-colors bg-brand-surface-muted/30"
                  aria-label="Instagram Link"
                  title="Follow Musha Empire Unisex Saloon on Instagram"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
                <a
                  id="contact-instagram-handle-link"
                  href={SALON_CONTACT.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-block text-[11px] font-sans text-brand-text-muted hover:text-brand-secondary transition-colors underline-offset-4 hover:underline"
                >
                  {SALON_CONTACT.instagramHandle}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Inquiry Form */}
        <div className="lg:col-span-7 bg-brand-surface border border-brand-accent/25 p-6 sm:p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Dispatch Inquiry
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
              Interactive Contact Form
            </h2>
            <div className="luxury-divider" />
          </div>

          <form id="contact-interactive-form" onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="contact-form-name" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Full Name <span className="text-brand-secondary">*</span>
                </label>
                <input
                  id="contact-form-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Richard Sterling"
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="contact-form-email" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Email Address <span className="text-brand-secondary">*</span>
                </label>
                <input
                  id="contact-form-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. richard@sterling.com"
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="contact-form-phone" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Phone Number
                </label>
                <input
                  id="contact-form-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +44 7700 900077"
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                />
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label htmlFor="contact-form-subject" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Nature of Inquiry <span className="text-brand-secondary">*</span>
                </label>
                <select
                  id="contact-form-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                >
                  <option value="Consultation Request">Custom Consultation Request</option>
                  <option value="Bridal Suite Booking">Bridal & Wedding Suite Booking</option>
                  <option value="VIP Cabin Lockout">VIP Golden Cabin Lockout</option>
                  <option value="Corporate Membership">Corporate Club Memberships</option>
                  <option value="Other feedback">Other General Inquiry</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="contact-form-message" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                Your Detailed Message <span className="text-brand-secondary">*</span>
              </label>
              <textarea
                id="contact-form-message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Explain what bespoke assistance you require..."
                className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none resize-none"
              />
            </div>

            {/* Form Alert States */}
            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 text-green-800 p-4 border border-green-200 text-xs font-sans flex items-start gap-2.5"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Message Dispatched Successfully!</strong>
                    <span>Your request has been filed under tracking index #{Date.now().toString().slice(-6)}. Our primary concierge will connect with you via email or SMS in less than 2 hours.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Trigger */}
            <Button
              id="contact-form-submit-btn"
              variant="secondary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Send className="h-4 w-4" />}
              className="w-full uppercase font-bold"
            >
              Dispatch Inquiry
            </Button>
          </form>
        </div>

      </div>

      {/* Google Maps Real Interactive Section */}
      <section id="contact-map-section" className="mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
            Find the Lounge
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
            {SALON_CONTACT.businessName}
          </h2>
          <div className="luxury-divider my-3 max-w-xs mx-auto" />
          <p className="font-sans text-xs text-brand-text-muted mt-2">
            Experience royal treatment at our premier unisex salon. Navigate seamlessly via Google Maps.
          </p>
        </div>

        {/* Real Interactive Google Maps Container */}
        <div
          id="google-maps-embed-container"
          className="relative w-full h-[400px] sm:h-[480px] md:h-[520px] border border-[#E6DCCB] bg-[#FAF7F0] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(33,29,24,0.06)] group"
        >
          {/* Interactive Google Maps iframe */}
          <iframe
            id="google-maps-iframe"
            title="Musha Empire Unisex Saloon Google Maps Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.331405834807!2d78.5022432!3d13.5618237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb267c1e2fad32d%3A0x30d259b47450d413!2sMusha%20Empire%20Unisex%20Saloon%20and%20Beauty%20Lounge!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full block"
          />

          {/* Luxury Floating Location Card */}
          <div
            id="map-floating-card"
            className="absolute top-4 left-4 max-w-[280px] sm:max-w-xs bg-white/95 backdrop-blur-md border border-[#E6DCCB] p-4 sm:p-5 rounded-xl shadow-[0_8px_24px_rgba(33,29,24,0.08)] pointer-events-auto"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-brand-secondary font-semibold mb-1">
              <MapPin className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
              <span>Flagship Sanctuary</span>
            </div>
            <h4 className="font-serif text-sm sm:text-base font-semibold text-[#211D18]">
              {SALON_CONTACT.businessName}
            </h4>
            <p className="font-sans text-[11px] text-[#746B60] mt-1 leading-relaxed">
              {hasAddress ? `${addressLine1} ${addressLine2}`.trim() : 'Gnanodaya Ground, Prasanth Nagar, A.V.Naidu Colony, Madanapalle, Andhra Pradesh 517325'}
            </p>
            <a
              id="contact-map-external-link"
              href={SALON_CONTACT.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider font-bold text-brand-secondary hover:text-[#211D18] transition-colors cursor-pointer"
            >
              <span>Open in Google Maps</span>
              <span className="text-sm font-normal">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Action Button underneath */}
        <div className="mt-6 flex justify-center">
          <a
            id="contact-google-maps-btn"
            href={SALON_CONTACT.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18] border border-brand-secondary/40 hover:border-transparent font-heading text-xs font-bold uppercase tracking-widest transition-all rounded-xl shadow-xs hover:shadow-md cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </section>
    </div>
  );
}
