/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EXTENDED_SERVICES_DATA, ExtendedService } from '../../data/servicesExtendedData';
import Card from '../ui/Card';
import { Chip } from '../ui/Badge';
import Button from '../ui/Button';
import { Clock, Tag, Sparkles, ArrowRight } from 'lucide-react';

export interface ServicesProps {
  onBookService?: (id: string) => void;
  onExploreAll?: () => void;
}

export default function Services({ onBookService, onExploreAll }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Highlights' },
    { id: 'combos', label: 'Exclusive Combos' },
    { id: 'men', label: "King's Care" },
    { id: 'women', label: "Queen's Styling" },
    { id: 'treatments', label: 'Hair Treatments' },
    { id: 'skin', label: 'Facials & Skin' },
    { id: 'bridal', label: 'Bridal & Groom' }
  ];

  // Curate popular and representative services from the shared authoritative catalog
  const highlightServices = useMemo(() => {
    // Select curated signature offerings from EXTENDED_SERVICES_DATA
    const curatedIds = [
      'combo-haircut-beard',
      'combo-pedicure-manicure',
      'kings-haircut',
      'kings-hair-spa',
      'queens-haircut-advance',
      'queens-treat-smoothening-keratin',
      'queens-facials',
      'queens-hydra-facial',
      'bridal-reception',
      'bridal-bride-package-4-sittings',
      'bridal-grooms-package-2-sittings',
      'queens-styling-party-juda'
    ];

    const curated = EXTENDED_SERVICES_DATA.filter(s => curatedIds.includes(s.id));
    return curated.length > 0 ? curated : EXTENDED_SERVICES_DATA.slice(0, 8);
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return highlightServices;
    if (selectedCategory === 'combos') {
      return EXTENDED_SERVICES_DATA.filter(s => s.category === 'Combos');
    }
    if (selectedCategory === 'men') {
      return EXTENDED_SERVICES_DATA.filter(s => s.gender === 'Men' && s.category === "Men's Services").slice(0, 6);
    }
    if (selectedCategory === 'women') {
      return EXTENDED_SERVICES_DATA.filter(s => s.gender === 'Women' && s.category === "Women's Services").slice(0, 6);
    }
    if (selectedCategory === 'treatments') {
      return EXTENDED_SERVICES_DATA.filter(s => s.category === 'Hair Treatments').slice(0, 6);
    }
    if (selectedCategory === 'skin') {
      return EXTENDED_SERVICES_DATA.filter(s => s.category === 'Skin & Facials').slice(0, 6);
    }
    if (selectedCategory === 'bridal') {
      return EXTENDED_SERVICES_DATA.filter(s => s.category === 'Makeup & Bridal').slice(0, 6);
    }
    return highlightServices;
  }, [selectedCategory, highlightServices]);

  const handleBook = (service: ExtendedService) => {
    if (onBookService) {
      onBookService(service.id);
    }
  };

  return (
    <section id="services" className="py-24 bg-brand-bg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            OFFICIAL SERVICE RATES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
            Our Signature <span className="italic font-bold text-gold-gradient">Salon Rituals</span>
          </h2>
          <div className="luxury-divider" />
          <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal">
            Directly from the Musha Empire King&apos;s and Queen&apos;s price lists. Authentic rates in Indian Rupees (₹) with zero markup and master artisan care.
          </p>
        </div>

        {/* Categories Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              id={`service-cat-chip-${cat.id}`}
              isSelected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Chip>
          ))}
        </div>

        {/* Services Grid with Framer Motion AnimatePresence */}
        {filteredServices.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Sparkles className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">No services found in this category</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Please choose another department to browse our official salon menu.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  layout
                  key={service.id}
                  id={`service-card-wrapper-${service.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col h-full"
                >
                  <Card
                    id={`service-card-${service.id}`}
                    variant="bordered"
                    hoverable
                    className="flex flex-col h-full p-0 overflow-hidden bg-brand-surface border-brand-accent/40"
                  >
                    {/* Service Image banner */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-brand-primary">
                      <img
                        src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                        alt={service.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 right-4 bg-brand-bg/85 backdrop-blur-md border border-brand-secondary/35 text-brand-secondary text-xs uppercase font-sans tracking-widest px-3 py-1 font-semibold">
                        {service.price}
                      </div>
                      {service.sectionTitle && (
                        <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 border border-brand-secondary/20 font-mono text-[8px] uppercase tracking-wider text-brand-secondary">
                          {service.sectionTitle}
                        </div>
                      )}
                    </div>

                    {/* Service Contents */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-[10px] font-sans text-brand-secondary uppercase tracking-widest font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {service.duration}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {service.category}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg md:text-xl font-bold text-brand-primary leading-snug group-hover:text-brand-secondary transition-colors">
                          {service.name}
                        </h3>
                        <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal line-clamp-3">
                          {service.shortDescription}
                        </p>

                        {/* Tiers preview if available */}
                        {service.tiers && service.tiers.length > 0 && (
                          <div className="pt-2 border-t border-brand-secondary/10 flex flex-wrap gap-1.5">
                            {service.tiers.slice(0, 3).map((tier) => (
                              <span key={tier.name} className="font-mono text-[9px] px-1.5 py-0.5 bg-brand-bg border border-brand-secondary/20 text-brand-text-muted">
                                {tier.name}: <strong className="text-brand-secondary font-semibold">{tier.price}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <Button
                          id={`service-book-btn-${service.id}`}
                          variant="link"
                          size="sm"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                          onClick={() => handleBook(service)}
                          className="w-full flex justify-between items-center group/btn text-[10px] tracking-widest font-bold font-sans uppercase text-brand-gold-dark cursor-pointer"
                        >
                          Book Ritual
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Full Catalog Button */}
        {onExploreAll && (
          <div className="text-center mt-14 flex justify-center">
            <button
              id="home-view-all-services-btn"
              onClick={onExploreAll}
              className="w-full max-w-xs sm:max-w-md h-[56px] md:h-[60px] px-8 bg-[#E7D2B4] text-[#1A1A1A] border-none rounded-[16px] font-sans font-semibold text-sm tracking-[0.5px] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:bg-[#DDC39D] hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#E7D2B4] opacity-100 cursor-pointer"
            >
              <span>EXPLORE FULL 11-CATEGORY CATALOG</span>
              <ArrowRight className="h-4 w-4 text-[#1A1A1A] shrink-0" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
