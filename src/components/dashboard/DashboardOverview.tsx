/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles, Calendar, Wallet, Award, ArrowRight, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { DashboardUser, DashboardAppointment } from './types';
import Button from '../ui/Button';

interface DashboardOverviewProps {
  id: string;
  user: DashboardUser;
  appointments: DashboardAppointment[];
  onNavigateView: (view: any) => void;
  onOpenQuickBook: () => void;
  onOpenAddMoney: () => void;
  onOpenRedeemRewards: () => void;
}

export default function DashboardOverview({
  id,
  user,
  appointments,
  onNavigateView,
  onOpenQuickBook,
  onOpenAddMoney,
  onOpenRedeemRewards
}: DashboardOverviewProps) {
  // Get next upcoming appointment
  const nextAppointment = appointments
    .filter((app) => app.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div id={id} className="space-y-6">
      {/* 1. Welcome Card Banner */}
      <motion.div
        id={`${id}-welcome-card`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-brand-surface text-brand-text p-8 md:p-10 border border-brand-secondary/15 overflow-hidden"
      >
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-secondary/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-secondary inline-flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3 w-3" /> PRIVATE EMPIRE MEMBER
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Good day, {user.name}
            </h1>
            <p className="font-sans text-xs text-brand-text-muted mt-2 max-w-md leading-relaxed font-normal">
              Welcome back to your tailored sanctuary portal. Enjoy your priority status, view active bookings, or top up your premium treatments wallet.
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-3 w-full md:w-auto">
            <Button
              id="dashboard-quick-book-btn"
              variant="primary"
              size="md"
              leftIcon={<Calendar className="h-4 w-4" />}
              onClick={onOpenQuickBook}
              className="w-full xs:w-auto px-6 font-sans text-xs uppercase tracking-widest font-bold"
            >
              Book Treatment
            </Button>
            <Button
              id="dashboard-explore-catalog-btn"
              variant="outline"
              size="md"
              onClick={() => onNavigateView('appointments')}
              className="w-full xs:w-auto border-brand-secondary/30 text-brand-secondary hover:border-brand-secondary hover:text-white hover:bg-brand-secondary/10 font-sans text-xs uppercase tracking-widest font-semibold"
            >
              View Sessions
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. Visual Metric Widgets Grid */}
      <div id={`${id}-metrics-grid`} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallet Balance widget */}
        <motion.div
          id="metric-wallet"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-brand-surface border border-brand-accent p-5 sm:p-6 flex flex-col justify-between hover:border-brand-secondary/40 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start">
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold">
              Empire Wallet
            </span>
            <div className="h-8 w-8 bg-brand-gold-light border border-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-brand-primary transition-all duration-300 shrink-0">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-brand-primary">
              ${user.walletBalance.toFixed(2)}
            </span>
            <div className="flex justify-between items-center mt-2 gap-2">
              <span className="font-sans text-[10px] text-brand-text-muted truncate">
                Pre-funded credits
              </span>
              <button
                id="overview-add-money-trigger"
                onClick={onOpenAddMoney}
                className="font-sans text-[10px] uppercase tracking-wider font-bold text-brand-gold-dark hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Top Up
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loyalty Points widget */}
        <motion.div
          id="metric-loyalty"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-brand-surface border border-brand-accent p-5 sm:p-6 flex flex-col justify-between hover:border-brand-secondary/40 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start">
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold">
              Loyalty Rewards
            </span>
            <div className="h-8 w-8 bg-brand-gold-light border border-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-brand-primary transition-all duration-300 shrink-0">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-brand-primary">
              {user.loyaltyPoints} PTS
            </span>
            <div className="flex justify-between items-center mt-2 gap-2">
              <span className="font-sans text-[10px] text-brand-text-muted truncate">
                Level Gold Tier
              </span>
              <button
                id="overview-redeem-trigger"
                onClick={onOpenRedeemRewards}
                className="font-sans text-[10px] uppercase tracking-wider font-bold text-brand-gold-dark hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                Redeem Perks &rarr;
              </button>
            </div>
          </div>
        </motion.div>

        {/* Saved Addresses / Count widget */}
        <motion.div
          id="metric-appointments-count"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-brand-surface border border-brand-accent p-5 sm:p-6 flex flex-col justify-between hover:border-brand-secondary/40 transition-all duration-300 group sm:col-span-1"
        >
          <div className="flex justify-between items-start">
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold">
              Active Sessions
            </span>
            <div className="h-8 w-8 bg-brand-gold-light border border-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-brand-primary transition-all duration-300 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-brand-primary">
              {appointments.filter((app) => app.status === 'upcoming').length} Booked
            </span>
            <div className="flex justify-between items-center mt-2 gap-2">
              <span className="font-sans text-[10px] text-brand-text-muted truncate">
                Includes private spa room
              </span>
              <button
                id="overview-appointments-trigger"
                onClick={() => onNavigateView('appointments')}
                className="font-sans text-[10px] uppercase tracking-wider font-bold text-brand-gold-dark hover:underline cursor-pointer shrink-0"
              >
                View Slots &rarr;
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Upcoming Appointment & Quick Actions Split layout */}
      <div id={`${id}-splits`} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Scheduled Appointment */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-lg font-medium text-brand-primary flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-brand-secondary" /> Next Priority Appointment
          </h3>

          {nextAppointment ? (
            <div
              id="next-appointment-hero-card"
              className="bg-brand-surface border border-brand-secondary/40 p-6 shadow-sm relative overflow-hidden group"
            >
              {/* Premium stripe accent */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-secondary" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-3">
                <div className="flex gap-4 items-center">
                  <img
                    src={nextAppointment.stylistAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'}
                    alt={nextAppointment.stylistName}
                    className="h-14 w-14 border border-brand-accent rounded-none object-cover"
                  />
                  <div>
                    <span className="bg-brand-gold-light text-brand-gold-dark font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-brand-secondary/20 inline-block mb-1.5">
                      {nextAppointment.category}
                    </span>
                    <h4 className="font-serif text-xl font-medium text-brand-primary">
                      {nextAppointment.serviceName}
                    </h4>
                    <p className="font-sans text-xs text-brand-text-muted mt-1">
                      Stylist Master: <span className="text-brand-primary font-medium">{nextAppointment.stylistName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 text-left sm:text-right border-t sm:border-t-0 border-brand-surface-muted pt-3 sm:pt-0 w-full sm:w-auto">
                  <div className="font-serif text-lg font-medium text-brand-primary">
                    {nextAppointment.date}
                  </div>
                  <div className="font-sans text-xs text-brand-text-muted flex items-center sm:justify-end gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-brand-secondary" /> {nextAppointment.timeSlot} ({nextAppointment.duration})
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gold-dark font-semibold bg-brand-gold-light border border-brand-secondary/20 px-2.5 py-0.5 rounded-none self-start sm:self-auto mt-1">
                    {nextAppointment.paymentStatus === 'paid' ? '● Paid' : '○ Pay at Counter'}
                  </span>
                </div>
              </div>

              <div className="border-t border-brand-surface-muted mt-6 pt-4 flex flex-col xs:flex-row gap-2.5 justify-end">
                <Button
                  id="overview-appointment-details-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateView('appointments')}
                  className="w-full xs:w-auto font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary py-2.5"
                >
                  View Access Ticket (QR)
                </Button>
                <Button
                  id="overview-appointment-reschedule-btn"
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateView('appointments')}
                  className="w-full xs:w-auto font-sans text-[10px] uppercase tracking-wider font-semibold py-2.5"
                >
                  Manage Reservation
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-brand-surface border border-dashed border-brand-accent p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
              <div className="h-12 w-12 rounded-none bg-brand-surface-muted flex items-center justify-center text-brand-text-muted mb-4 border border-brand-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="font-serif text-lg font-medium text-brand-primary">No Upcoming Treatments</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-xs mt-1.5">
                Reserve an luxurious styling sessions or high-end hair spa today to refresh your elegant style.
              </p>
              <Button
                id="overview-schedule-first-btn"
                variant="primary"
                size="sm"
                className="mt-5 font-sans text-[10px] uppercase tracking-widest font-bold py-2.5 px-6 w-full xs:w-auto"
                onClick={onOpenQuickBook}
              >
                Book Priority Slot
              </Button>
            </div>
          )}
        </div>

        {/* Custom Actions list widget */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-medium text-brand-primary flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-secondary" /> Express Luxury Operations
          </h3>

          <div className="bg-brand-surface border border-brand-accent p-4 sm:p-6 space-y-3">
            <button
              id="express-act-add-funds"
              onClick={onOpenAddMoney}
              className="w-full text-left p-3 border border-brand-surface-muted hover:border-brand-secondary hover:bg-brand-gold-light/40 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 bg-brand-surface-muted border border-brand-accent flex items-center justify-center text-brand-gold-dark group-hover:border-brand-secondary/40 shrink-0">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-medium text-brand-primary truncate">Fund Wallet</h4>
                  <p className="font-sans text-[10px] text-brand-text-muted truncate">Instant top-up with premium bonus cards</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-text-muted group-hover:text-brand-secondary transition-colors shrink-0 ml-2" />
            </button>

            <button
              id="express-act-claim-loyalty"
              onClick={onOpenRedeemRewards}
              className="w-full text-left p-3 border border-brand-surface-muted hover:border-brand-secondary hover:bg-brand-gold-light/40 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 bg-brand-surface-muted border border-brand-accent flex items-center justify-center text-brand-gold-dark group-hover:border-brand-secondary/40 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-medium text-brand-primary truncate">Claim Loyalty Gifts</h4>
                  <p className="font-sans text-[10px] text-brand-text-muted truncate">Redeem accumulated points for free treatments</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-text-muted group-hover:text-brand-secondary transition-colors shrink-0 ml-2" />
            </button>

            <button
              id="express-act-sessions"
              onClick={() => onNavigateView('appointments')}
              className="w-full text-left p-3 border border-brand-surface-muted hover:border-brand-secondary hover:bg-brand-gold-light/40 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 bg-brand-surface-muted border border-brand-accent flex items-center justify-center text-brand-gold-dark group-hover:border-brand-secondary/40 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-medium text-brand-primary truncate">Upcoming Sessions</h4>
                  <p className="font-sans text-[10px] text-brand-text-muted truncate">Review active appointments & QR passes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-text-muted group-hover:text-brand-secondary transition-colors shrink-0 ml-2" />
            </button>

            <button
              id="express-act-profile"
              onClick={() => onNavigateView('profile')}
              className="w-full text-left p-3 border border-brand-surface-muted hover:border-brand-secondary hover:bg-brand-gold-light/40 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 bg-brand-surface-muted border border-brand-accent flex items-center justify-center text-brand-gold-dark group-hover:border-brand-secondary/40 shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-medium text-brand-primary truncate">Personal Records</h4>
                  <p className="font-sans text-[10px] text-brand-text-muted truncate">Manage profile details and style preferences</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-text-muted group-hover:text-brand-secondary transition-colors shrink-0 ml-2" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
