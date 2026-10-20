/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Saloon — Global Search Modal
 * Fast, keyboard-accessible instant search across all services and master stylists.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Clock, User, ArrowRight, Sparkles, Scissors, Check, Tag } from 'lucide-react';
import { EXTENDED_SERVICES_DATA, ExtendedService } from '../../data/servicesExtendedData';
import { STYLISTS_DATA, StylistItem } from '../../data/salonData';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceId: string) => void;
  onSelectStylist?: (stylistId: string) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectService,
  onSelectStylist
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'services'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setActiveFilter('all');
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts (Cmd+K, Ctrl+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return EXTENDED_SERVICES_DATA.slice(0, 5); // default preview

    return EXTENDED_SERVICES_DATA.filter((svc) => {
      const matchName = svc.name.toLowerCase().includes(cleanQuery);
      const matchCategory = svc.category.toLowerCase().includes(cleanQuery);
      const matchDesc = svc.shortDescription.toLowerCase().includes(cleanQuery);
      const matchGender = svc.gender?.toLowerCase().includes(cleanQuery);
      const matchBenefits = svc.benefits?.some(b => b.toLowerCase().includes(cleanQuery));
      return matchName || matchCategory || matchDesc || matchGender || matchBenefits;
    });
  }, [query]);

  // Filtered Stylists
  const filteredStylists = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return STYLISTS_DATA; // default preview

    return STYLISTS_DATA.filter((stylist) => {
      const matchName = stylist.name.toLowerCase().includes(cleanQuery);
      const matchRole = stylist.role.toLowerCase().includes(cleanQuery);
      const matchSpecialty = stylist.specialty.toLowerCase().includes(cleanQuery);
      const matchBio = stylist.bio.toLowerCase().includes(cleanQuery);
      return matchName || matchRole || matchSpecialty || matchBio;
    });
  }, [query]);

  const hasServices = (activeFilter === 'all' || activeFilter === 'services') && filteredServices.length > 0;
  const hasStylists = activeFilter === 'all' && filteredStylists.length > 0;
  const totalCount = filteredServices.length + filteredStylists.length;
  const isQueryEmpty = query.trim().length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="global-search-portal" className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md cursor-pointer"
          />

          {/* Search Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#FAF7F0] border border-[#E6DCCB] rounded-2xl shadow-[0_12px_48px_rgba(33,29,24,0.12)] overflow-hidden flex flex-col max-h-[82vh] z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#E6DCCB] bg-[#F1E9DC]">
              <Search className="h-5 w-5 text-brand-secondary shrink-0 stroke-[2]" />
              <input
                ref={inputRef}
                id="global-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search haircuts, spa facials, balayage, or stylists..."
                className="w-full bg-transparent text-[#211D18] placeholder-[#746B60] font-sans text-sm sm:text-base outline-none focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  id="search-clear-btn"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-[#746B60] hover:text-[#211D18] transition-colors"
                  title="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-[#E6DCCB]">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#746B60] bg-white border border-[#E6DCCB] rounded shadow-xs">
                  ESC
                </kbd>
              </div>
              <button
                type="button"
                id="search-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#746B60] hover:text-[#211D18] hover:bg-white/60 transition-all cursor-pointer"
                title="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#F6F0E6] border-b border-[#E6DCCB] text-xs">
              <span className="text-[#746B60] font-heading text-[10px] uppercase tracking-wider mr-1">Filter:</span>
              <button
                type="button"
                id="filter-all-btn"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-heading font-medium transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-brand-secondary text-[#211D18] font-bold shadow-xs'
                    : 'text-[#746B60] hover:text-[#211D18] hover:bg-white'
                }`}
              >
                All Results ({totalCount})
              </button>
              <button
                type="button"
                id="filter-services-btn"
                onClick={() => setActiveFilter('services')}
                className={`px-3 py-1 rounded-full text-xs font-heading font-medium transition-all cursor-pointer ${
                  activeFilter === 'services'
                    ? 'bg-brand-secondary text-[#211D18] font-bold shadow-xs'
                    : 'text-[#746B60] hover:text-[#211D18] hover:bg-white'
                }`}
              >
                Services ({filteredServices.length})
              </button>
            </div>

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 divide-y divide-[#E6DCCB]/60">
              {isQueryEmpty && (
                <div className="pb-2">
                  <div className="flex items-center gap-2 text-brand-secondary text-xs font-heading uppercase tracking-widest font-semibold mb-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Popular Curated Experiences</span>
                  </div>
                </div>
              )}

              {/* Services Section */}
              {hasServices && (
                <div className="space-y-3 pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-xs text-[#746B60] font-heading uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-brand-secondary font-semibold">
                      <Scissors className="h-3.5 w-3.5" /> Signature Salon Services
                    </span>
                    <span className="text-[11px] text-[#746B60] font-mono">{filteredServices.length} found</span>
                  </div>

                  <div className="space-y-2.5">
                    {filteredServices.map((svc) => (
                      <div
                        key={svc.id}
                        id={`search-svc-${svc.id}`}
                        onClick={() => {
                          onSelectService(svc.id);
                          onClose();
                        }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white hover:bg-[#F1E9DC]/60 border border-[#E6DCCB] hover:border-brand-secondary/50 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif text-sm sm:text-base font-semibold text-[#211D18] group-hover:text-brand-secondary transition-colors">
                              {svc.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-[#F1E9DC] text-brand-secondary border border-brand-secondary/30 font-semibold">
                              {svc.category}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-[#746B60] mt-1 line-clamp-1">
                            {svc.shortDescription}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#746B60] font-sans">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-brand-secondary" /> {svc.duration}
                            </span>
                            {svc.gender && (
                              <span>• {svc.gender}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6DCCB]">
                          <span className="font-serif text-base sm:text-lg font-bold text-brand-secondary">
                            {svc.price}
                          </span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F0] group-hover:bg-brand-secondary text-brand-secondary group-hover:text-[#211D18] border border-brand-secondary/30 group-hover:border-transparent font-heading text-xs uppercase tracking-wider font-bold transition-all"
                          >
                            <span>Book</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stylists Section */}
              {hasStylists && (
                <div className="space-y-3 pt-6">
                  <div className="flex items-center justify-between text-xs text-[#746B60] font-heading uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-brand-secondary font-semibold">
                      <User className="h-3.5 w-3.5" /> Master Stylists & Artists
                    </span>
                    <span className="text-[11px] text-[#746B60] font-mono">{filteredStylists.length} available</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredStylists.map((stylist) => (
                      <div
                        key={stylist.id}
                        id={`search-stylist-${stylist.id}`}
                        onClick={() => {
                          if (onSelectStylist) {
                            onSelectStylist(stylist.id);
                          } else {
                            onSelectService(EXTENDED_SERVICES_DATA[0].id);
                          }
                          onClose();
                        }}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#F1E9DC]/60 border border-[#E6DCCB] hover:border-brand-secondary/50 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <img
                          src={stylist.image}
                          alt={stylist.name}
                          className="h-12 w-12 rounded-lg object-cover border border-[#E6DCCB] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif text-sm font-semibold text-[#211D18] group-hover:text-brand-secondary transition-colors truncate">
                            {stylist.name}
                          </h4>
                          <p className="text-[11px] text-brand-secondary font-semibold truncate">
                            {stylist.role}
                          </p>
                          <p className="text-[10px] text-[#746B60] font-sans truncate mt-0.5">
                            {stylist.specialty}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#746B60] group-hover:text-brand-secondary group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty Results State */}
              {!hasServices && !hasStylists && (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#F1E9DC] border border-[#E6DCCB] flex items-center justify-center mx-auto text-[#746B60]">
                    <Search className="h-6 w-6 text-brand-secondary" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-[#211D18]">
                    No results found for "{query}"
                  </h4>
                  <p className="font-sans text-xs text-[#746B60] max-w-sm mx-auto">
                    Try searching for haircuts, hair spa, beard trim, balayage, facial, or browse our comprehensive service menu.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 bg-[#F1E9DC] border-t border-[#E6DCCB] flex items-center justify-between text-[11px] text-[#746B60] font-sans">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-brand-secondary" />
                <span>Instant reservations available 7 days a week</span>
              </span>
              <span className="font-mono text-[#211D18] font-semibold">
                Musha Empire Unisex Saloon
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
