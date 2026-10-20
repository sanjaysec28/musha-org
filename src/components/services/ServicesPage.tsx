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
    <div id="services-page-root" className="pb-24 bg-[#FAF7F0] text-[#211D18] min-h-screen">
      {/* 1. Header Hero Area */}
      <section id="services-hero-section" className="relative bg-[#FAF7F0] text-[#211D18] py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#B88A45_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F0] border border-[#E6DCCB] text-[#B88A45] text-[10px] uppercase tracking-[0.25em] font-sans font-semibold rounded-full shadow-xs"
          >
            <Sparkles className="h-3 w-3 text-[#B88A45]" /> OFFICIAL RATE CATALOG
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#211D18] leading-tight"
          >
            King&apos;s &amp; Queen&apos;s <span className="font-serif-italic text-[#B88A45]">Price List</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto font-sans text-xs md:text-sm text-[#746B60] leading-relaxed font-normal"
          >
            Complete and authentic service catalog with exact rates in Indian Rupees (₹). Browse all 11 dedicated categories across men&apos;s grooming, hair transformations, royal skin wellness, waxing, and bridal packages.
          </motion.p>
        </div>
      </section>

      {/* 2. Quick Recipient Filter Bar (Patron Profile) */}
      <section id="recipient-selection-section" className="border-y border-[#E6DCCB] bg-[#F1E9DC] py-8 md:py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#B88A45] block font-semibold">Quick Filter</span>
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#211D18]">Select Patron Profile</h2>
            </div>
            {selectedRecipientCategory && (
              <button
                onClick={() => onSelectRecipientCategory(null)}
                className="text-[11px] font-sans text-[#B88A45] hover:text-[#211D18] hover:underline cursor-pointer font-semibold transition-colors"
              >
                Clear Profile Filter (Show All)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { id: 'Men', emoji: '👑', icon: Shield, title: "King's Profile", desc: 'Men Grooming' },
              { id: 'Women', emoji: '✨', icon: Gem, title: "Queen's Profile", desc: 'Women Styling' },
              { id: 'Boy', emoji: '👦', icon: Compass, title: 'Boy Grooming', desc: 'Young Gentlemen' },
              { id: 'Girl', emoji: '👧', icon: Heart, title: 'Girl Haircut', desc: 'Kids Haircut Only' },
              { id: 'Other', emoji: '⚜️', icon: Sparkles, title: 'All Patrons', desc: 'Full Catalog' }
            ].map((rec, index) => {
              const isSelected = selectedRecipientCategory === rec.id;
              const IconComponent = rec.icon;
              const isLastOnMobile = index === 4;
              return (
                <button
                  key={rec.id}
                  id={`recipient-filter-${rec.id.toLowerCase()}`}
                  onClick={() => {
                    onSelectRecipientCategory(isSelected ? null : rec.id);
                  }}
                  className={`p-3.5 sm:p-4 text-left rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative min-h-[110px] sm:min-h-[120px] ${
                    isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    isSelected
                      ? 'bg-white border-2 border-[#B88A45] shadow-md shadow-[#B88A45]/15 ring-2 ring-[#B88A45]/20'
                      : 'bg-white border border-[#E6DCCB] hover:border-[#B88A45]/60 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 sm:p-2.5 bg-[#FAF7F0] rounded-lg border border-[#E6DCCB] text-[#B88A45]">
                      <IconComponent className="h-4 w-4 text-[#B88A45]" />
                    </div>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold bg-[#B88A45] text-[#211D18] shadow-xs">
                        Selected
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div>
                    <span className="font-serif text-xs sm:text-sm font-bold text-[#211D18] block leading-tight">{rec.title}</span>
                    <span className="font-sans text-[10px] sm:text-[11px] text-[#746B60] block mt-1 font-medium leading-tight">{rec.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Search, Filters, and Catalog Container */}
      <section id="catalog-controls-and-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-10">
        <div className="space-y-6">
          
          {/* Controls Panel */}
          <div className="bg-white border border-[#E6DCCB] rounded-2xl p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4 shadow-sm">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B88A45] pointer-events-none" />
              <input
                id="catalog-search"
                type="text"
                placeholder="Search services (e.g. Haircut, Keratin, Hydra Facial, Waxing, Beard, Rica)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF7F0] text-[#211D18] placeholder:text-[#746B60] font-sans text-xs pl-11 pr-4 py-3.5 border border-[#E6DCCB] rounded-xl focus:border-[#B88A45] focus:ring-1 focus:ring-[#B88A45] outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Sorter and Count */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A45] pointer-events-none flex items-center">
                  <ArrowUpDown className="h-3.5 w-3.5 text-[#B88A45]" />
                </div>
                <select
                  id="catalog-sorter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#FAF7F0] text-[#211D18] font-sans text-xs pl-10 pr-10 py-3.5 border border-[#E6DCCB] rounded-xl focus:border-[#B88A45] outline-none appearance-none cursor-pointer shadow-inner"
                >
                  <option value="recommended" className="bg-white text-[#211D18]">Sort: Recommended</option>
                  <option value="price-low-high" className="bg-white text-[#211D18]">Price: Low to High (₹)</option>
                  <option value="price-high-low" className="bg-white text-[#211D18]">Price: High to Low (₹)</option>
                  <option value="duration-low-high" className="bg-white text-[#211D18]">Duration: Short to Long</option>
                  <option value="rating" className="bg-white text-[#211D18]">Rating: Highest Rated</option>
                </select>
              </div>
              
              <div className="text-right font-mono text-[10px] text-[#746B60] font-semibold border-l border-[#E6DCCB] pl-4 py-2 hidden sm:block">
                {filteredAndSortedServices.length} SERVICES AVAILABLE
              </div>
            </div>
          </div>

          {/* Scope Item 1: The 11 Required Categories Rail */}
          <div id="category-filter-rail" className="overflow-hidden bg-white p-4 sm:p-5 border border-[#E6DCCB] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-[#E6DCCB] pb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#B88A45]" />
                <h3 className="font-sans text-[11px] uppercase tracking-widest font-bold text-[#211D18]">
                  11 Clear Salon Categories
                </h3>
              </div>
              <span className="font-mono text-[9px] text-[#B88A45] font-semibold">Musha Empire Catalog</span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-brand-accent/50">
              <button
                id="cat-filter-all"
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 text-left font-sans text-[10px] uppercase tracking-wider font-semibold transition-all border shrink-0 cursor-pointer rounded-lg ${
                  selectedCategory === 'All'
                    ? 'bg-brand-secondary border-brand-secondary text-[#211D18] font-bold shadow-sm'
                    : 'bg-[#FAF7F0] border-[#E6DCCB] text-[#211D18] hover:text-[#B88A45] hover:border-[#B88A45]/40 hover:bg-[#F1E9DC]'
                }`}
              >
                All Services <span className={selectedCategory === 'All' ? 'text-[#211D18]/90 font-bold' : 'text-[#B88A45] font-bold'}>({allServices.length})</span>
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
                    className={`px-4 py-2 text-left font-sans text-[10px] uppercase tracking-wider font-semibold transition-all border shrink-0 cursor-pointer rounded-lg ${
                      isSelected
                        ? 'bg-brand-secondary border-brand-secondary text-[#211D18] font-bold shadow-sm'
                        : 'bg-[#FAF7F0] border-[#E6DCCB] text-[#211D18] hover:text-[#B88A45] hover:border-[#B88A45]/40 hover:bg-[#F1E9DC]'
                    }`}
                  >
                    {cat} <span className={isSelected ? 'text-[#211D18]/90 font-bold' : 'text-[#B88A45] font-bold'}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Services Grid */}
          {filteredAndSortedServices.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[#E6DCCB] bg-white rounded-2xl p-12 max-w-xl mx-auto space-y-4 shadow-sm">
              <Sparkles className="h-8 w-8 text-[#B88A45] mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#211D18] uppercase">No Matching Services</h3>
              <p className="font-sans text-xs text-[#746B60] leading-relaxed font-normal">
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
                className="border-[#E6DCCB] text-[#211D18] hover:bg-[#FAF7F0] hover:border-[#B88A45]"
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
                    className="group relative rounded-2xl md:rounded-3xl border border-[#E6DCCB] bg-white overflow-hidden flex flex-col justify-between min-h-[480px] sm:min-h-[500px] p-6 sm:p-7 hover:border-brand-secondary/60 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-brand-secondary/10 text-left motion-reduce:transform-none shadow-sm"
                  >
                    {/* Background Photography with Controlled Luxury Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      <img
                        src={editorialImage}
                        alt={service.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {/* Multi-tier controlled dark gradient overlay so headings and descriptions over photography are crisp and readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40" />
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
                      {/* Subtle warm gold corner glow on hover */}
                      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-brand-secondary/15 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-secondary/25 transition-colors duration-500" />
                    </div>

                    {/* Foreground Content Container */}
                    <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
                      {/* Top Section: Badges & Headings */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-semibold bg-black/60 backdrop-blur-md border border-brand-secondary/40 text-brand-secondary shadow-sm">
                            <Tag className="w-3 h-3 text-brand-secondary" />
                            {service.category}
                          </span>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-brand-secondary bg-brand-secondary/20 px-2.5 py-0.5 rounded-full border border-brand-secondary/40 font-semibold backdrop-blur-sm">
                            {genderLabel}
                          </span>
                        </div>

                        <div>
                          {service.sectionTitle && (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-secondary font-semibold block mb-1">
                              {service.sectionTitle}
                            </span>
                          )}
                          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-brand-secondary transition-colors duration-300 leading-snug">
                            {service.name}
                          </h3>
                          <p className="font-sans text-xs sm:text-[13px] text-neutral-100 leading-relaxed mt-2 font-normal line-clamp-2 sm:line-clamp-3">
                            {service.shortDescription}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section: Actual Rate & Duration Details Box */}
                      <div className="space-y-3">
                        <div className="bg-white/95 backdrop-blur-md border border-[#E6DCCB] rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-md">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-sans text-[10px] uppercase tracking-wider text-[#746B60] font-semibold">
                                Service Rate:
                              </span>
                              <span className="font-heading text-lg sm:text-xl font-bold text-brand-secondary font-mono">
                                {service.price}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-[#746B60] font-semibold">
                              <Clock className="w-3 h-3 text-brand-secondary" />
                              {service.duration}
                            </span>
                          </div>

                          {/* Rate Tiers / Hair Lengths Breakdown if applicable */}
                          {service.tiers && service.tiers.length > 0 && (
                            <div className="border-t border-[#E6DCCB] pt-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-brand-secondary font-semibold">
                                <span className="flex items-center gap-1">
                                  <Layers className="h-3 w-3 text-brand-secondary" /> Options Breakdown
                                </span>
                                {service.tiers.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleTiers(service.id)}
                                    className="text-brand-secondary hover:text-[#211D18] underline cursor-pointer text-[10px] font-semibold"
                                  >
                                    {isExpanded ? 'Less' : `All (${service.tiers.length})`}
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-1.5 font-sans text-xs">
                                {(isExpanded ? service.tiers : service.tiers.slice(0, 2)).map((tier) => (
                                  <div
                                    key={tier.name}
                                    className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF7F0] border border-[#E6DCCB] rounded-lg text-[11px]"
                                  >
                                    <div className="flex items-center gap-1 text-[#211D18] truncate mr-2 font-medium">
                                      <span className="truncate">{tier.name}</span>
                                      {tier.note && (
                                        <span className="text-[9px] text-[#746B60] font-normal shrink-0">
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
                            <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-[10px] font-sans flex items-start gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                              <span className="font-medium">{service.reviewNote || 'Rate subject to salon consultation.'}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Section: Book Now CTA & Details Link */}
                        <div className="pt-1 flex items-center justify-between gap-3">
                          <button
                            id={`book-service-${service.id}`}
                            onClick={() => onBookService(service.id)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold uppercase tracking-wider bg-brand-secondary text-[#211D18] hover:bg-[#D8B77A] hover:shadow-lg hover:shadow-brand-secondary/20 transition-all duration-300 group/btn cursor-pointer active:scale-[0.98]"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                          </button>

                          <button
                            id={`view-detail-${service.id}`}
                            onClick={() => onSelectService(service.id)}
                            className="px-3.5 py-3 rounded-xl border border-[#E6DCCB] bg-white text-[#211D18] hover:text-brand-secondary hover:border-brand-secondary/60 text-xs font-sans uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-sm"
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
            <div id="recently-viewed-section" className="mt-16 pt-10 border-t border-[#E6DCCB]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary block font-semibold">History</span>
                  <h3 className="font-serif text-xl font-bold text-[#211D18]">Recently Viewed Services</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentlyViewedServices.map((rSvc) => (
                  <div
                    key={rSvc.id}
                    onClick={() => onSelectService(rSvc.id)}
                    className="p-4 bg-white border border-[#E6DCCB] rounded-xl hover:border-brand-secondary/50 shadow-sm transition-all cursor-pointer text-left space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-brand-secondary font-semibold">{rSvc.category}</span>
                      <span className="font-serif text-xs font-bold text-brand-secondary">{rSvc.price}</span>
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-[#211D18] group-hover:text-brand-secondary transition-colors line-clamp-1">{rSvc.name}</h4>
                    <span className="font-mono text-[9px] text-[#746B60] flex items-center gap-1 font-medium"><Clock className="h-3 w-3 text-brand-secondary" /> {rSvc.duration}</span>
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
