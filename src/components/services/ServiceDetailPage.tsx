/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, ShieldCheck, HelpCircle, Star, Calendar, ChevronRight } from 'lucide-react';
import { EXTENDED_SERVICES_DATA, ExtendedService } from '../../data/servicesExtendedData';
import Card from '../ui/Card';
import Accordion from '../ui/Accordion';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ServiceDetailPageProps {
  serviceId: string;
  onBack: () => void;
  onBook: (id: string) => void;
  onSelectService?: (id: string) => void;
}

export default function ServiceDetailPage({ serviceId, onBack, onBook, onSelectService }: ServiceDetailPageProps) {
  // Find current service
  const service = useMemo(() => {
    return EXTENDED_SERVICES_DATA.find((s) => s.id === serviceId) || EXTENDED_SERVICES_DATA[0];
  }, [serviceId]);

  // Find related services (same category, excluding current service)
  const relatedServices = useMemo(() => {
    return EXTENDED_SERVICES_DATA.filter(
      (s) => s.category === service.category && s.id !== service.id
    ).slice(0, 3);
  }, [service]);

  // Scroll to top when loading a service detail page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [serviceId]);

  // Convert FAQs to Accordion format
  const accordionFaqs = useMemo(() => {
    return service.faqs.map((faq, i) => ({
      id: `service-faq-${i}`,
      title: faq.question,
      content: <p className="font-sans text-xs text-[#746B60] dark:text-neutral-300 leading-relaxed font-normal">{faq.answer}</p>,
    }));
  }, [service]);

  return (
    <div id={`service-detail-${service.id}`} className="pb-32 text-left relative bg-brand-bg text-[#211D18] min-h-screen">
      {/* 1. Sticky Booking CTA at Bottom */}
      <div
        id="sticky-booking-bar"
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E6DCCB] py-4 px-6 z-30 shadow-[0_-4px_20px_rgba(33,29,24,0.06)] flex items-center justify-between max-w-7xl mx-auto"
      >
        <div className="flex flex-col text-left">
          <span className="font-sans text-[9px] uppercase tracking-widest text-[#746B60] font-medium">Selected Experience</span>
          <span className="font-serif text-sm md:text-base font-semibold text-[#211D18] truncate max-w-[180px] md:max-w-xs">{service.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col justify-center">
            <span className="font-mono text-[10px] text-[#746B60] uppercase tracking-wider font-medium">{service.duration}</span>
            <span className="font-serif text-base font-bold text-brand-secondary">{service.price}</span>
          </div>
          <Button
            id="sticky-book-btn"
            variant="primary"
            size="md"
            leftIcon={<Calendar className="h-4 w-4" />}
            onClick={() => onBook(service.id)}
            className="px-6 py-3 font-sans text-xs uppercase tracking-widest font-bold bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18] rounded-xl shadow-sm transition-all duration-300 cursor-pointer"
          >
            Book Experience
          </Button>
        </div>
      </div>

      {/* 2. Top Breadcrumb & Back Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#746B60] hover:text-[#211D18] font-sans text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-brand-secondary" /> Back to Catalog
        </button>
      </div>

      {/* 3. Hero & Base Info Section */}
      <section id="service-detail-hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Large Hero Image */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[16/10] bg-[#FAF7F0] rounded-2xl overflow-hidden border border-[#E6DCCB] shadow-sm"
            >
              <img
                id="detail-hero-img"
                src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                alt={service.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {service.popular && (
                <div className="absolute top-6 left-6">
                  <Badge id="detail-popular-badge" variant="gold" size="md">
                    <Star className="h-3.5 w-3.5 fill-current mr-1" /> Royal Favorite
                  </Badge>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Brief Info */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary bg-brand-secondary/15 px-2.5 py-1 border border-brand-secondary/30 rounded-full inline-block">
                {service.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#211D18] leading-tight">
                {service.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 font-sans text-xs text-[#746B60] font-medium">
                <div className="flex text-brand-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(service.rating) ? 'fill-current' : 'opacity-20'}`} />
                  ))}
                </div>
                <span className="font-semibold text-[#211D18]">{service.rating}</span>
                <span>({service.reviewsCount} reviews)</span>
              </div>
            </div>

            <p className="font-sans text-xs md:text-sm text-[#746B60] leading-relaxed font-normal">
              {service.shortDescription}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 border-y border-[#E6DCCB] py-5">
              <div className="text-left">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#746B60] block mb-1 font-semibold">Official Price</span>
                <span className="font-serif text-2xl font-bold text-brand-secondary font-mono">{service.price}</span>
              </div>
              <div className="text-left border-l border-[#E6DCCB] pl-4">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#746B60] block mb-1 font-semibold">Duration</span>
                <span className="font-sans text-sm font-semibold text-[#211D18] flex items-center gap-1.5 mt-1">
                  <Clock className="h-4 w-4 text-brand-secondary" /> {service.duration}
                </span>
              </div>
            </div>

            {/* Unclear price alert if applicable */}
            {service.unclearPrice && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-sans text-left space-y-1 rounded-xl">
                <span className="font-bold block text-amber-700">⚠️ Manual Review Required:</span>
                <p>{service.reviewNote || 'This rate entry was omitted in the salon printed price sheet. Please confirm with reception.'}</p>
              </div>
            )}

            {/* Rate Tiers Table / Lengths if present */}
            {service.tiers && service.tiers.length > 0 && (
              <div className="space-y-2 text-left bg-white border border-[#E6DCCB] rounded-xl p-4 shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-secondary block font-semibold">
                  Authoritative Rate Tiers
                </span>
                <div className="divide-y divide-[#E6DCCB]">
                  {service.tiers.map((tier) => (
                    <div key={tier.name} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[#211D18] font-medium">{tier.name}</span>
                        {tier.note && <span className="text-[#746B60] text-[11px] ml-1.5 font-normal">({tier.note})</span>}
                      </div>
                      <span className="font-serif font-bold text-brand-secondary">{tier.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              id="detail-book-hero-btn"
              variant="primary"
              size="lg"
              onClick={() => onBook(service.id)}
              className="w-full text-xs uppercase tracking-widest font-bold py-4 cursor-pointer bg-brand-secondary hover:bg-[#D8B77A] text-[#211D18] rounded-xl shadow-sm transition-all duration-300"
            >
              Reserve Experience Slot
            </Button>
          </div>

        </div>
      </section>

      {/* 4. Deep Details (Included Services, Benefits & Description) */}
      <section id="service-detail-tabs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 border-t border-[#E6DCCB] pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Editorial & Inclusions */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-[#211D18] font-bold">The Ritual Experience</h3>
              <p className="font-sans text-xs md:text-sm text-[#746B60] leading-relaxed font-normal whitespace-pre-line">
                {service.longDescription}
              </p>
            </div>

            {/* Included Procedures */}
            <div className="space-y-4 bg-white border border-[#E6DCCB] rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="font-serif text-lg text-[#211D18] font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-secondary" /> What’s Included in Your Session
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {service.includedServices.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 font-sans text-xs text-[#746B60] leading-relaxed font-normal">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary mt-1.5 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits Column & FAQ */}
          <div className="lg:col-span-5 space-y-8">
            {/* Core Benefits */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-[#211D18] font-bold">Bespoke Benefits</h3>
              <div className="space-y-4">
                {service.benefits.map((ben, i) => (
                  <div key={i} className="flex gap-3 text-left">
                    <span className="font-mono text-xs text-brand-secondary font-bold shrink-0 mt-0.5">0{i + 1}.</span>
                    <p className="font-sans text-xs text-[#746B60] leading-relaxed font-normal">{ben}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Service FAQ */}
            <div className="space-y-4 border-t border-[#E6DCCB] pt-8">
              <h3 className="font-serif text-xl text-[#211D18] font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-brand-secondary" /> Frequently Asked Questions
              </h3>
              <Accordion id="service-specific-faq" items={accordionFaqs} />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Related Services Section */}
      {relatedServices.length > 0 && (
        <section id="service-related-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-[#E6DCCB] pt-16">
          <div className="mb-8">
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary block mb-1 font-semibold">Explore Further</span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#211D18] font-bold">Similar Luxury Rituals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedServices.map((related) => (
              <div
                key={related.id}
                id={`related-service-card-${related.id}`}
                className="bg-white border border-[#E6DCCB] hover:border-brand-secondary/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={related.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'} alt={related.name} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-1">
                    <h4 className="font-serif text-base font-semibold text-[#211D18] leading-tight group-hover:text-brand-secondary transition-colors">{related.name}</h4>
                    <p className="font-sans text-xs text-[#746B60] leading-relaxed font-normal line-clamp-2">{related.shortDescription}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E6DCCB]">
                    <span className="font-serif text-base text-brand-secondary font-bold">{related.price}</span>
                    <Button
                      id={`related-view-btn-${related.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        // Propagate selecting another service
                        if (onSelectService) {
                          onSelectService(related.id);
                        } else {
                          onBook(related.id);
                        }
                      }}
                      className="text-[9px] py-2 h-auto px-4 border-[#E6DCCB] text-[#211D18] hover:bg-[#FAF7F0] hover:border-brand-secondary"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
