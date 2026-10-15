/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Public Service Catalog
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  ArrowUpDown,
  Sparkles,
  Tag,
  Shield,
  Gem,
  Compass,
  Heart,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Scissors,
  ArrowRight
} from 'lucide-react';
import {
  EXTENDED_SERVICES_DATA,
  CATALOG_CATEGORIES,
  ExtendedService
} from '../../data/servicesExtendedData';
import { getServiceEditorialImage } from '../../utils/serviceImages';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ServicesPageProps {
  onSelectService: (id: string) => void;
  onBookService: (id: string) => void;
  recentlyViewedIds: string[];
  onNavigate?: (view: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404') => void;
  selectedRecipientCategory: string | null;
  onSelectRecipientCategory: (category: string | null) => void;
}

export default function ServicesPage({
  onSelectService,
  onBookService,
  recentlyViewedIds,
  onNavigate,
  selectedRecipientCategory,
  onSelectRecipientCategory,
}: ServicesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [expandedTierCardId, setExpandedTierCardId] = useState<string | null>(null);

  const allServices = EXTENDED_SERVICES_DATA;

  // Recently viewed services
  const recentlyViewedServices = useMemo(() => {
    return allServices.filter((s) => recentlyViewedIds.includes(s.id));
  }, [allServices, recentlyViewedIds]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let result = [...allServices];

    // 1. Recipient filter (if active)
    if (selectedRecipientCategory) {
      if (selectedRecipientCategory === 'Men') {
        result = result.filter(s => s.gender === 'Men' || s.applicableCategories?.includes("Men's Services"));
      } else if (selectedRecipientCategory === 'Women') {
        result = result.filter(s => s.gender === 'Women' || s.applicableCategories?.includes("Women's Services"));
      } else if (selectedRecipientCategory === 'Boy') {
        result = result.filter(s => s.gender === 'Kids' || s.id.includes('boy') || (s.gender === 'Men' && s.priceValue <= 200));
      } else if (selectedRecipientCategory === 'Girl') {
        result = result.filter(s => s.gender === 'Kids' || s.id === 'kids-haircut-girl');
      }
      // 'Other' displays all services
    }

    // 2. Department category filter
    if (selectedCategory !== 'All') {
      result = result.filter((s) =>
        s.category.toLowerCase() === selectedCategory.toLowerCase() ||
        s.applicableCategories?.some(c => c.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.longDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.sectionTitle && s.sectionTitle.toLowerCase().includes(q)) ||
          s.tiers?.some(t => t.name.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q)))
      );
    }

    // 4. Sort options
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => b.priceValue - a.priceValue);
    } else if (sortBy === 'duration-low-high') {
      result.sort((a, b) => a.durationValue - b.durationValue);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allServices, selectedRecipientCategory, selectedCategory, searchQuery, sortBy]);

  const toggleTiers = (id: string) => {
    setExpandedTierCardId(prev => prev === id ? null : id);
  };

  return (
    <div id="services-page-root" className="pb-24">
      {/* 1. Header Hero Area */}
      <section id="services-hero-section" className="relative bg-brand-bg text-brand-primary py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-[10px] uppercase tracking-[0.25em] font-sans font-semibold"
          >
            <Sparkles className="h-3 w-3" /> OFFICIAL RATE CATALOG
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-brand-primary leading-tight"
          >
            King&apos;s &amp; Queen&apos;s <span className="font-serif-italic text-brand-secondary">Price List</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal"
          >
            Complete and authentic service catalog with exact rates in Indian Rupees (₹). Browse all 11 dedicated categories across men&apos;s grooming, hair transformations, royal skin wellness, waxing, and bridal packages.
          </motion.p>
        </div>
      </section>

      {/* 2. Welcome Promo Voucher */}
      <section id="special-offers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-[#121212] border border-brand-secondary/20 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 bg-brand-secondary/10 border border-brand-secondary/30 text-brand-secondary shrink-0">
              <Tag className="h-6 w-6 stroke-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[9px] uppercase tracking-widest font-semibold text-brand-secondary bg-brand-secondary/15 px-2 py-0.5">Salon Privilege</span>
                <span className="font-mono text-[9px] text-brand-text-muted">Direct Booking</span>
              </div>
              <h3 className="font-serif text-lg text-brand-primary font-bold">The Royal Welcome Courtesy</h3>
              <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-xl">
                Enjoy 15% privilege credit on your first appointment across any hair or facial ritual. Quote code <span className="font-mono font-semibold text-brand-secondary">ROYAL15</span> at reservation.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="border border-dashed border-brand-secondary/30 px-4 py-3 bg-[#0A0A0A] text-center flex flex-col justify-center">
              <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Privilege Code</span>
              <span className="font-mono text-xs font-bold text-brand-secondary tracking-wider">ROYAL15</span>
            </div>
            <Button
              id="redeem-offer-btn"
              variant="primary"
              size="sm"
              onClick={() => onBookService('combo-haircut-beard')}
              className="px-6 py-3 cursor-pointer"
            >
              Book Featured Combo (₹129)
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 2.5 Quick Recipient Filter Bar */}
      <section id="recipient-selection-section" className="border-y border-brand-secondary/15 bg-[#121212] py-8 md:py-10 mt-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary block">Quick Filter</span>
              <h2 className="text-lg md:text-xl font-serif font-bold text-brand-primary">Select Patron Profile</h2>
            </div>
            {selectedRecipientCategory && (
              <button
                onClick={() => onSelectRecipientCategory(null)}
                className="text-[11px] font-sans text-brand-secondary hover:underline cursor-pointer"
              >
                Clear Profile Filter (Show All)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'Men', emoji: '👑', icon: Shield, title: "King's Profile", desc: 'Men Grooming' },
              { id: 'Women', emoji: '✨', icon: Gem, title: "Queen's Profile", desc: 'Women Styling' },
              { id: 'Boy', emoji: '👦', icon: Compass, title: 'Boy Grooming', desc: 'Young Gentlemen' },
              { id: 'Girl', emoji: '👧', icon: Heart, title: 'Girl Haircut', desc: 'Kids Haircut Only' },
              { id: 'Other', emoji: '⚜️', icon: Sparkles, title: 'All Patrons', desc: 'Full Catalog' }
            ].map((rec) => {
              const isSelected = selectedRecipientCategory === rec.id;
              const IconComponent = rec.icon;
              return (
                <button
                  key={rec.id}
                  id={`recipient-filter-${rec.id.toLowerCase()}`}
                  onClick={() => {
                    onSelectRecipientCategory(isSelected ? null : rec.id);
                  }}
                  className={`p-3.5 sm:p-4 text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 relative ${
                    isSelected
                      ? 'bg-brand-surface border-brand-secondary ring-1 ring-brand-secondary/40 shadow-lg'
                      : 'bg-brand-bg/80 border-brand-secondary/15 hover:border-brand-secondary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-brand-surface rounded-none border border-brand-secondary/20 text-brand-secondary">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-brand-secondary" />
                    )}
                  </div>
                  <div>
                    <span className="font-serif text-xs sm:text-sm font-bold text-brand-primary block">{rec.title}</span>
                    <span className="font-sans text-[10px] text-brand-text-muted block mt-0.5">{rec.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Search, Filters, and Catalog Container */}
      <section id="catalog-controls-and-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="space-y-6">
          
          {/* Controls Panel */}
          <div className="bg-brand-surface border border-brand-secondary/15 p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted pointer-events-none" />
              <input
                id="catalog-search"
                type="text"
                placeholder="Search services (e.g. Haircut, Keratin, Hydra Facial, Waxing, Beard, Rica)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0E0E0E] text-brand-text font-sans text-xs pl-11 pr-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none transition-all duration-300"
              />
            </div>

            {/* Sorter and Count */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none flex items-center">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
                <select
                  id="catalog-sorter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0E0E0E] text-brand-text font-sans text-xs pl-10 pr-10 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none appearance-none cursor-pointer"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-low-high">Price: Low to High (₹)</option>
                  <option value="price-high-low">Price: High to Low (₹)</option>
                  <option value="duration-low-high">Duration: Short to Long</option>
                  <option value="rating">Rating: Highest Rated</option>
                </select>
              </div>
              
              <div className="text-right font-mono text-[10px] text-brand-text-muted border-l border-brand-secondary/15 pl-4 py-2 hidden sm:block">
                {filteredAndSortedServices.length} SERVICES AVAILABLE
              </div>
            </div>
          </div>

          {/* Scope Item 1: The 11 Required Categories Rail */}
          <div id="category-filter-rail" className="overflow-hidden bg-[#121212] p-4 border border-brand-secondary/15">
            <div className="flex items-center justify-between mb-3 border-b border-brand-secondary/15 pb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-brand-secondary" />
                <h3 className="font-sans text-[11px] uppercase tracking-widest font-semibold text-brand-primary">
                  11 Clear Salon Categories
                </h3>
              </div>
              <span className="font-mono text-[9px] text-brand-secondary">Musha Empire Catalog</span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              <button
                id="cat-filter-all"
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 text-left font-sans text-[10px] uppercase tracking-wider font-semibold transition-all border shrink-0 cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-brand-secondary border-brand-secondary text-[#121212] font-bold shadow-md'
                    : 'bg-brand-surface border-brand-secondary/15 text-brand-text-muted hover:text-brand-primary hover:border-brand-secondary'
                }`}
              >
                All Services ({allServices.length})
              </button>

              {CATALOG_CATEGORIES.map((cat) => {
                const count = allServices.filter(
                  (s) => s.category.toLowerCase() === cat.toLowerCase() || s.applicableCategories?.some(c => c.toLowerCase() === cat.toLowerCase())
                ).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-left font-sans text-[10px] uppercase tracking-wider font-semibold transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-secondary border-brand-secondary text-[#121212] font-bold shadow-md'
                        : 'bg-brand-surface border-brand-secondary/15 text-brand-text-muted hover:text-brand-primary hover:border-brand-secondary'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Services Grid */}
          {filteredAndSortedServices.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-brand-secondary/25 bg-brand-surface p-12 max-w-xl mx-auto space-y-4">
              <Sparkles className="h-8 w-8 text-brand-secondary mx-auto" />
              <h3 className="font-serif text-xl font-bold text-brand-primary uppercase">No Matching Services</h3>
              <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                No rituals found matching &quot;{searchQuery}&quot; under the selected filters.
              </p>
              <Button
                id="reset-filters-btn"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  onSelectRecipientCategory(null);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredAndSortedServices.map((service, idx) => {
                const isExpanded = expandedTierCardId === service.id;
                const editorialImage = getServiceEditorialImage(service);

                const genderLabel =
                  service.gender === 'Men'
                    ? "King's Service"
                    : service.gender === 'Women'
                    ? "Queen's Service"
                    : service.gender === 'Kids'
                    ? 'Kids Service'
                    : 'Unisex Ritual';

                return (
                  <motion.div
                    key={service.id}
                    id={`service-catalog-card-${service.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: Math.min((idx % 3) * 0.08, 0.24) }}
                    className="group relative rounded-2xl md:rounded-3xl border border-brand-secondary/20 bg-[#0E0E0E] overflow-hidden flex flex-col justify-between min-h-[480px] sm:min-h-[500px] p-6 sm:p-7 hover:border-brand-secondary/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-brand-secondary/10 text-left motion-reduce:transform-none"
                  >
                    {/* Background Photography with Luxury Dark Overlays */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      <img
                        src={editorialImage}
                        alt={service.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {/* Multi-tier dark gradient overlay for optimal typography readability while allowing photograph to remain visible */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40" />
                      <div className="absolute inset-0 bg-[#0A0A0A]/30 backdrop-blur-[0.5px]" />
                      {/* Subtle warm gold corner glow on hover */}
                      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-secondary/20 transition-colors duration-500" />
                    </div>

                    {/* Foreground Content Container */}
                    <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
                      {/* Top Section: Badges & Headings */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-semibold bg-brand-bg/85 backdrop-blur-md border border-brand-secondary/35 text-brand-secondary">
                            <Tag className="w-3 h-3 text-brand-secondary" />
                            {service.category}
                          </span>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-brand-secondary/80 bg-brand-secondary/10 px-2.5 py-0.5 rounded-full border border-brand-secondary/20">
                            {genderLabel}
                          </span>
                        </div>

                        <div>
                          {service.sectionTitle && (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-secondary/70 block mb-1">
                              {service.sectionTitle}
                            </span>
                          )}
                          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-brand-secondary transition-colors duration-300 leading-snug">
                            {service.name}
                          </h3>
                          <p className="font-sans text-xs sm:text-[13px] text-[#E5E5E5]/80 leading-relaxed mt-2 font-normal line-clamp-2 sm:line-clamp-3">
                            {service.shortDescription}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section: Actual Rate & Duration Details Box */}
                      <div className="space-y-3">
                        <div className="bg-brand-bg/75 backdrop-blur-md border border-brand-secondary/20 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">
                                Service Rate:
                              </span>
                              <span className="font-heading text-lg sm:text-xl font-bold text-brand-secondary font-mono">
                                {service.price}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-brand-text-muted font-medium">
                              <Clock className="w-3 h-3 text-brand-secondary/80" />
                              {service.duration}
                            </span>
                          </div>

                          {/* Rate Tiers / Hair Lengths Breakdown if applicable */}
                          {service.tiers && service.tiers.length > 0 && (
                            <div className="border-t border-brand-secondary/15 pt-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-brand-secondary">
                                <span className="flex items-center gap-1">
                                  <Layers className="h-3 w-3" /> Options Breakdown
                                </span>
                                {service.tiers.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleTiers(service.id)}
                                    className="text-brand-secondary/80 hover:text-white underline cursor-pointer text-[10px]"
                                  >
                                    {isExpanded ? 'Less' : `All (${service.tiers.length})`}
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-1 font-sans text-xs">
                                {(isExpanded ? service.tiers : service.tiers.slice(0, 2)).map((tier) => (
                                  <div
                                    key={tier.name}
                                    className="flex items-center justify-between px-2.5 py-1 bg-[#0D0D0D]/70 border border-brand-secondary/15 rounded text-[11px]"
                                  >
                                    <div className="flex items-center gap-1 text-white/90 truncate mr-2">
                                      <span className="truncate">{tier.name}</span>
                                      {tier.note && (
                                        <span className="text-[9px] text-brand-text-muted font-normal shrink-0">
                                          ({tier.note})
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono font-bold text-brand-secondary shrink-0">
                                      {tier.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Advisory Notice if price is unclear */}
                          {service.unclearPrice && (
                            <div className="p-2 bg-amber-950/40 border border-amber-600/40 rounded text-amber-200 text-[10px] font-sans flex items-start gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                              <span>{service.reviewNote || 'Rate subject to salon consultation.'}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Section: Book Now CTA & Details Link */}
                        <div className="pt-1 flex items-center justify-between gap-3">
                          <button
                            id={`book-service-${service.id}`}
                            onClick={() => onBookService(service.id)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider bg-brand-secondary text-[#0A0A0A] hover:bg-[#E7D2B4] hover:shadow-lg hover:shadow-brand-secondary/20 transition-all duration-300 group/btn cursor-pointer active:scale-[0.98]"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                          </button>

                          <button
                            id={`view-detail-${service.id}`}
                            onClick={() => onSelectService(service.id)}
                            className="px-3.5 py-3 rounded-xl border border-brand-secondary/30 bg-brand-bg/60 text-brand-secondary hover:text-white hover:border-brand-secondary/60 text-xs font-sans uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                            title="View Service Details"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* 5. Recently Viewed Section */}
          {recentlyViewedServices.length > 0 && (
            <div id="recently-viewed-section" className="mt-16 pt-10 border-t border-brand-secondary/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary block">History</span>
                  <h3 className="font-serif text-xl font-bold text-brand-primary">Recently Viewed Services</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentlyViewedServices.map((rSvc) => (
                  <div
                    key={rSvc.id}
                    onClick={() => onSelectService(rSvc.id)}
                    className="p-4 bg-brand-surface border border-brand-secondary/15 hover:border-brand-secondary/40 transition-all cursor-pointer text-left space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-brand-secondary">{rSvc.category}</span>
                      <span className="font-serif text-xs font-bold text-brand-gold-dark">{rSvc.price}</span>
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-brand-primary group-hover:text-brand-secondary transition-colors line-clamp-1">{rSvc.name}</h4>
                    <span className="font-mono text-[9px] text-brand-text-muted flex items-center gap-1"><Clock className="h-3 w-3" /> {rSvc.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
