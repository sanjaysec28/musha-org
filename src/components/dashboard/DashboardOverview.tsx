/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Customer Portal Overview
 * 
 * Design System: Bright Creamy Luxury
 * - Background: Warm Ivory (#FAF7F0)
 * - Cards: Pure White (#FFFFFF), Rounded (#E6DCCB borders)
 * - Headings: Playfair Display
 * - Body: Plus Jakarta Sans
 * - Tasteful emoji-style icons inspired by GitHub activity visuals
 * - ₹ INR formatting everywhere, zero dummy data, zero loyalty points section
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Wallet,
  Clock,
  ArrowRight,
  PlusCircle,
  Sparkles,
  QrCode,
  ShieldCheck,
  User,
  ChevronRight
} from 'lucide-react';
import { DashboardUser, DashboardAppointment } from './types';
import Button from '../ui/Button';

interface DashboardOverviewProps {
  id: string;
  user: DashboardUser;
  appointments: DashboardAppointment[];
  onNavigateView: (view: any) => void;
  onOpenQuickBook: () => void;
  onOpenAddMoney: () => void;
  onOpenRedeemRewards?: () => void;
}

export default function DashboardOverview({
  id,
  user,
  appointments,
  onNavigateView,
  onOpenQuickBook,
  onOpenAddMoney
}: DashboardOverviewProps) {
  // Filter for real upcoming appointments
  const upcomingAppointments = appointments.filter(
    (app) => app.status === 'upcoming' || (app.realStatus && app.realStatus !== 'cancelled')
  );

  const nextAppointment = upcomingAppointments
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const walletBalanceFormatted = `₹ ${(user.walletBalance || 0).toLocaleString('en-IN')}`;

  return (
    <div id={id} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Welcome Card Banner */}
      <motion.div
        id={`${id}-welcome-card`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white border border-[#E6DCCB] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_rgba(33,29,24,0.03)] overflow-hidden"
      >
        {/* Subtle warm champagne-gold ambient glow */}
        <div
          className="absolute -right-16 -top-16 w-80 h-80 bg-[#B88A45]/[0.07] rounded-full blur-[80px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-[#B88A45] inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> PRIVATE SALON SANCTUARY
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#211D18]">
              Good day, {user.name || 'Valued Patron'}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#746B60] mt-2 leading-relaxed">
              Welcome back to your private Musha Empire portal. Access active grooming reservations,
              inspect digital salon passes, and manage your prepaid treatments balance.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row gap-3 w-full md:w-auto shrink-0">
            <Button
              id="dashboard-quick-book-btn"
              variant="primary"
              size="md"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={onOpenQuickBook}
              className="w-full xs:w-auto bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-6 font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
            >
              Book Treatment
            </Button>
            <Button
              id="dashboard-explore-catalog-btn"
              variant="outline"
              size="md"
              onClick={() => onNavigateView('appointments')}
              className="w-full xs:w-auto border-[#E6DCCB] text-[#211D18] hover:border-[#B88A45] hover:text-[#B88A45] hover:bg-[#FAF7F0] rounded-full px-6 font-sans text-xs uppercase tracking-wider font-semibold"
            >
              View Sessions
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. Visual Metric Widgets (Consistently formatted in ₹ INR — No Rewards points section) */}
      <div id={`${id}-metrics-grid`} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Wallet Balance Widget */}
        <motion.div
          id="metric-wallet"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="bg-white border border-[#E6DCCB] hover:border-[#D8B77A]/60 rounded-2xl p-6 shadow-[0_4px_20px_rgba(33,29,24,0.03)] flex flex-col justify-between transition-all duration-300 group"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#746B60] font-semibold block">
                💳 Empire Salon Wallet
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#211D18] mt-2">
                {walletBalanceFormatted}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-[#B88A45] group-hover:bg-[#B88A45] group-hover:text-white transition-all duration-300 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E6DCCB]/60">
            <span className="font-sans text-xs text-[#746B60]">
              Prepaid balance for desk settlements
            </span>
            <button
              id="overview-add-money-trigger"
              type="button"
              onClick={onOpenAddMoney}
              className="font-sans text-xs font-bold text-[#B88A45] hover:text-[#A07435] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Top Up Balance
            </button>
          </div>
        </motion.div>

        {/* Active Sessions Widget */}
        <motion.div
          id="metric-appointments-count"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-white border border-[#E6DCCB] hover:border-[#D8B77A]/60 rounded-2xl p-6 shadow-[0_4px_20px_rgba(33,29,24,0.03)] flex flex-col justify-between transition-all duration-300 group"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#746B60] font-semibold block">
                🗓️ Active Grooming Sessions
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#211D18] mt-2">
                {upcomingAppointments.length} Booked
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-[#B88A45] group-hover:bg-[#B88A45] group-hover:text-white transition-all duration-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E6DCCB]/60">
            <span className="font-sans text-xs text-[#746B60]">
              Confirmed at Musha Empire desk
            </span>
            <button
              id="overview-appointments-trigger"
              type="button"
              onClick={() => onNavigateView('appointments')}
              className="font-sans text-xs font-bold text-[#B88A45] hover:text-[#A07435] flex items-center gap-1 cursor-pointer transition-colors"
            >
              View Sessions <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3. Next Priority Appointment Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B88A45]" /> Next Scheduled Appointment
          </h2>
          {nextAppointment && (
            <button
              type="button"
              onClick={() => onNavigateView('appointments')}
              className="text-xs font-sans font-semibold text-[#B88A45] hover:underline"
            >
              All Sessions &rarr;
            </button>
          )}
        </div>

        {nextAppointment ? (
          <div
            id="next-appointment-hero-card"
            className="bg-white border border-[#B88A45]/30 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(33,29,24,0.03)] relative overflow-hidden"
          >
            {/* Fine gold vertical accent */}
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#B88A45]" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-2">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-2xl shrink-0">
                  ✂️
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-sans text-[11px] font-semibold text-[#B88A45] bg-[#FAF7F0] px-2.5 py-0.5 rounded-full border border-[#B88A45]/20">
                      {nextAppointment.category || 'Grooming Service'}
                    </span>
                    {nextAppointment.ticketCode && (
                      <span className="font-mono text-[10px] text-[#746B60] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#E6DCCB]">
                        REF: {nextAppointment.ticketCode}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18]">
                    {nextAppointment.serviceName}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#746B60] mt-1.5 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-[#211D18]">
                      🗓️ {nextAppointment.date}
                    </span>
                    <span className="text-[#E6DCCB]">·</span>
                    <span className="flex items-center gap-1 font-medium text-[#211D18]">
                      ⏱️ {nextAppointment.timeSlot}
                    </span>
                    <span className="text-[#E6DCCB]">·</span>
                    <span className="flex items-center gap-1">
                      👤 {nextAppointment.stylistName || 'Salon Concierge'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#E6DCCB]">
                <div className="text-left md:text-right pr-4 hidden md:block">
                  <span className="text-[10px] uppercase font-sans text-[#746B60] block font-semibold">
                    Amount Payable
                  </span>
                  <span className="font-serif text-xl font-bold text-[#211D18]">
                    ₹ {(nextAppointment.price || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-sans text-[#B88A45] block">
                    Payment at Salon Desk
                  </span>
                </div>

                <Button
                  id="overview-view-ticket-btn"
                  variant="primary"
                  size="md"
                  leftIcon={<QrCode className="w-4 h-4" />}
                  onClick={() => onNavigateView('appointments')}
                  className="bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-6 font-sans text-xs uppercase tracking-wider font-semibold"
                >
                  Digital Ticket
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Graceful Empty State (Zero dummy appointments) */
          <div
            id="next-appointment-empty-state"
            className="bg-white border border-[#E6DCCB] rounded-2xl p-8 sm:p-10 text-center shadow-[0_4px_20px_rgba(33,29,24,0.02)]"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-2xl mb-4">
              🗓️
            </div>
            <h3 className="font-serif text-xl font-bold text-[#211D18]">
              No Active Sessions Scheduled
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#746B60] max-w-md mx-auto mt-2 leading-relaxed">
              You currently have no upcoming styling or spa reservations.
              Choose from our master haircutting, balayage, beard grooming, or private spa treatments.
            </p>
            <div className="mt-6">
              <Button
                id="empty-overview-book-btn"
                variant="primary"
                size="md"
                onClick={onOpenQuickBook}
                className="bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-7 font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
              >
                Book Your First Session
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Quick Action Visual Strip (Inspired by GitHub activity badges) */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18]">
          Quick Portal Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Sessions */}
          <button
            type="button"
            onClick={() => onNavigateView('appointments')}
            className="p-5 rounded-2xl bg-white border border-[#E6DCCB] hover:border-[#D8B77A] shadow-[0_2px_12px_rgba(33,29,24,0.02)] text-left transition-all duration-300 group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl p-2 rounded-xl bg-[#FAF7F0] border border-[#E6DCCB]">
                🗓️
              </span>
              <div>
                <span className="font-serif font-bold text-base text-[#211D18] block group-hover:text-[#B88A45] transition-colors">
                  All Sessions
                </span>
                <span className="font-sans text-xs text-[#746B60]">
                  View tickets, QR codes &amp; history
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#E6DCCB] group-hover:text-[#B88A45] transition-colors shrink-0" />
          </button>

          {/* Action 2: Wallet */}
          <button
            type="button"
            onClick={() => onNavigateView('wallet')}
            className="p-5 rounded-2xl bg-white border border-[#E6DCCB] hover:border-[#D8B77A] shadow-[0_2px_12px_rgba(33,29,24,0.02)] text-left transition-all duration-300 group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl p-2 rounded-xl bg-[#FAF7F0] border border-[#E6DCCB]">
                💳
              </span>
              <div>
                <span className="font-serif font-bold text-base text-[#211D18] block group-hover:text-[#B88A45] transition-colors">
                  Empire Wallet
                </span>
                <span className="font-sans text-xs text-[#746B60]">
                  Top up credits &amp; view transactions
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#E6DCCB] group-hover:text-[#B88A45] transition-colors shrink-0" />
          </button>

          {/* Action 3: Profile */}
          <button
            type="button"
            onClick={() => onNavigateView('profile')}
            className="p-5 rounded-2xl bg-white border border-[#E6DCCB] hover:border-[#D8B77A] shadow-[0_2px_12px_rgba(33,29,24,0.02)] text-left transition-all duration-300 group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl p-2 rounded-xl bg-[#FAF7F0] border border-[#E6DCCB]">
                👤
              </span>
              <div>
                <span className="font-serif font-bold text-base text-[#211D18] block group-hover:text-[#B88A45] transition-colors">
                  Identity Records
                </span>
                <span className="font-sans text-xs text-[#746B60]">
                  Edit credentials &amp; styling notes
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#E6DCCB] group-hover:text-[#B88A45] transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
