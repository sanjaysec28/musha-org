/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  ArrowUpDown,
  QrCode,
  Download,
  AlertCircle,
  XCircle,
  Sparkles,
  MapPin,
  CheckCircle,
  TrendingDown,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { DashboardAppointment } from './types';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';
import { settingsRepository, conciergeRequestsRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings, FirestoreConciergeRequest } from '../../types/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { callCancelBooking, callRescheduleBooking, mapBookingError } from '../../lib/firebaseFunctions';
import { auth } from '../../lib/firebase';

interface DashboardAppointmentsProps {
  id: string;
  appointments: DashboardAppointment[];
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment: (id: string, date: string, time: string) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
  initialTab?: 'upcoming' | 'requests' | 'completed' | 'cancelled';
}

export default function DashboardAppointments({
  id,
  appointments,
  onCancelAppointment,
  onRescheduleAppointment,
  triggerToast,
  initialTab
}: DashboardAppointmentsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'requests' | 'completed' | 'cancelled'>(() => {
    if (initialTab) return initialTab;
    try {
      const savedTab = sessionStorage.getItem('musha_portal_initial_tab');
      if (savedTab && ['upcoming', 'requests', 'completed', 'cancelled'].includes(savedTab)) {
        sessionStorage.removeItem('musha_portal_initial_tab');
        return savedTab as 'upcoming' | 'requests' | 'completed' | 'cancelled';
      }
    } catch {}
    return 'upcoming';
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [conciergeRequests, setConciergeRequests] = useState<FirestoreConciergeRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const { user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStylist, setSelectedStylist] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'price-desc' | 'price-asc'>('date-asc');

  // Detail & Action modal triggers
  const [activeDetailAppointment, setActiveDetailAppointment] = useState<DashboardAppointment | null>(null);
  const [activeCancelConfirm, setActiveCancelConfirm] = useState<DashboardAppointment | null>(null);
  const [activeReschedule, setActiveReschedule] = useState<DashboardAppointment | null>(null);

  // Reschedule form inputs
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((s) => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in DashboardAppointments:', err);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      const uid = auth?.currentUser?.uid || authUser?.uid || (authUser as any)?.id;
      if (!uid) return;
      setLoadingRequests(true);
      try {
        const reqs = await conciergeRequestsRepository.getMyRequests(uid);
        if (isMounted && reqs) {
          const sorted = [...reqs].sort((a, b) => {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          });
          setConciergeRequests(sorted);
        }
      } catch (err) {
        console.warn('Notice reading my concierge requests:', err);
      } finally {
        if (isMounted) setLoadingRequests(false);
      }
    };
    fetchRequests();
    return () => { isMounted = false; };
  }, [authUser]);

  // Extract list of stylists for filtering
  const stylists = Array.from(new Set(appointments.map((app) => app.stylistName)));

  // Filter & Search Logic
  const filteredAppointments = appointments.filter((app) => {
    // Tab validation
    if (app.status !== activeTab) return false;

    // Search query matches service or stylist
    const matchSearch =
      app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.stylistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Stylist match
    const matchStylist = selectedStylist === 'all' || app.stylistName === selectedStylist;

    return matchSearch && matchStylist;
  });

  // Sort Logic
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else {
      return a.price - b.price;
    }
  });

  const handleDownloadInvoice = (app: DashboardAppointment) => {
    triggerToast(
      'success',
      'Generating Premium Invoice',
      `Invoice MSH-${app.id.slice(-6).toUpperCase()} is compiling. Download will begin momentarily.`
    );
  };

  const { user } = useAuth();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleConfirmCancel = async () => {
    if (!activeCancelConfirm) return;
    setIsActionLoading(true);
    try {
      if (user?.id || (user as any)?.uid) {
        await callCancelBooking(
          { bookingId: activeCancelConfirm.id },
          (user as any)?.uid || user.id
        );
      }
      onCancelAppointment(activeCancelConfirm.id);
      triggerToast(
        'warning',
        'Appointment Released',
        `Your booking ${activeCancelConfirm.id} has been cancelled. Associated slots have been released.`
      );
      setActiveCancelConfirm(null);
    } catch (err: any) {
      triggerToast('error', 'Cancellation Error', mapBookingError(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      triggerToast('error', 'Missing Information', 'Please select a valid date and available hour slot.');
      return;
    }

    if (activeReschedule) {
      setIsActionLoading(true);
      try {
        if (user?.id || (user as any)?.uid) {
          await callRescheduleBooking(
            {
              bookingId: activeReschedule.id,
              bookingDate: newDate,
              startTime: newTime
            },
            (user as any)?.uid || user.id
          );
        }
        onRescheduleAppointment(activeReschedule.id, newDate, newTime);
        triggerToast(
          'success',
          'Reservation Adjusted',
          `Treatment ${activeReschedule.serviceName} is rescheduled to ${newDate} at ${newTime}.`
        );
        setActiveReschedule(null);
        setNewDate('');
        setNewTime('');
      } catch (err: any) {
        triggerToast('error', 'Reschedule Error', mapBookingError(err));
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const timeSlots = useMemo(() => {
    if (!salonSettings) return [];
    const hoursList = (salonSettings.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : null;
    if (!hoursList || hoursList.length === 0) return [];

    let targetDay = null;
    if (newDate) {
      const dayName = new Date(newDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      targetDay = hoursList.find(h => h.day.toLowerCase() === dayName.toLowerCase());
    } else {
      targetDay = hoursList.find(h => !h.isClosed && h.open && h.close);
    }

    if (!targetDay || targetDay.isClosed || !targetDay.open || !targetDay.close) return [];

    const parseTimeToMin = (tStr: string) => {
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return null;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const formatMin = (min: number) => {
      const h24 = Math.floor(min / 60);
      const m = min % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const oMin = parseTimeToMin(targetDay.open);
    const cMin = parseTimeToMin(targetDay.close);
    if (oMin === null || cMin === null || cMin <= oMin) return [];

    const slots: string[] = [];
    for (let m = oMin; m < cMin; m += 30) {
      slots.push(formatMin(m));
    }
    return slots;
  }, [salonSettings, newDate]);

  return (
    <div id={id} className="space-y-6">
      {/* Search, Filter, Sort Controls bar */}
      <div className="bg-brand-surface border border-brand-accent p-3.5 sm:p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted" />
          <input
            id="appointments-search-field"
            type="text"
            placeholder="Search treatments, stylists, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg text-brand-text pl-10 pr-4 py-2.5 font-sans text-xs border border-brand-accent focus:border-brand-secondary outline-none transition-all duration-300"
          />
        </div>

        {/* Filter / Sort Selects */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Stylist Filter */}
          <div className="flex items-center gap-2 bg-brand-bg border border-brand-accent px-3 py-2 flex-1 xs:flex-initial">
            <Filter className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              id="appointments-stylist-filter"
              value={selectedStylist}
              onChange={(e) => setSelectedStylist(e.target.value)}
              className="bg-transparent text-brand-text font-sans text-xs outline-none focus:text-brand-primary cursor-pointer w-full"
            >
              <option value="all" className="bg-brand-surface text-brand-text">All Stylists</option>
              {stylists.map((st) => (
                <option key={st} value={st} className="bg-brand-surface text-brand-text">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 bg-brand-bg border border-brand-accent px-3 py-2 flex-1 xs:flex-initial">
            <ArrowUpDown className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              id="appointments-sorting"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-brand-text font-sans text-xs outline-none focus:text-brand-primary cursor-pointer w-full"
            >
              <option value="date-asc" className="bg-brand-surface text-brand-text">Date (Ascending)</option>
              <option value="date-desc" className="bg-brand-surface text-brand-text">Date (Descending)</option>
              <option value="price-desc" className="bg-brand-surface text-brand-text">Price (High to Low)</option>
              <option value="price-asc" className="bg-brand-surface text-brand-text">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-brand-accent overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-0 -mx-1 sm:mx-0 px-1 sm:px-0">
        {(['upcoming', 'requests', 'completed', 'cancelled'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === 'requests'
            ? conciergeRequests.length
            : appointments.filter((app) => app.status === tab).length;
          const label = tab === 'requests' ? 'Concierge Requests' : tab;
          return (
            <button
              key={tab}
              id={`tab-appointments-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 sm:flex-1 px-3 sm:px-4 py-3 sm:py-3.5 font-sans text-[11px] sm:text-xs uppercase tracking-wider font-semibold border-b-2 text-center transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-brand-secondary text-brand-primary bg-brand-surface font-bold'
                  : 'border-transparent text-brand-text-muted hover:text-brand-primary'
              }`}
            >
              {label} <span className="opacity-75 font-mono text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Appointment Timeline List or Concierge Requests List */}
      <div className="space-y-4">
        {activeTab === 'requests' ? (
          conciergeRequests.length > 0 ? (
            <div className="space-y-4">
              {conciergeRequests.map((req) => {
                const statusColor =
                  req.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : req.status === 'reviewed'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : req.status === 'contacted'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : req.status === 'cancelled'
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                const statusLabel =
                  req.status === 'completed'
                    ? 'Converted to Appointment'
                    : req.status === 'reviewed'
                    ? 'Reviewed by Desk'
                    : req.status === 'contacted'
                    ? 'Patron Contacted'
                    : req.status === 'cancelled'
                    ? 'Cancelled'
                    : 'Awaiting Concierge Confirmation';

                return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-brand-surface border border-brand-accent p-4 sm:p-6 hover:border-brand-secondary/40 transition-all duration-300 relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2 min-w-0 w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-secondary font-bold">
                            #{req.id}
                          </span>
                          <span className={`font-mono text-[8px] uppercase px-2 py-0.5 border ${statusColor}`}>
                            {statusLabel}
                          </span>
                          {req.payment_status === 'paid' && (
                            <span className="font-mono text-[8px] uppercase px-2 py-0.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> Paid Online
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-medium text-brand-primary truncate">
                          {req.service_name || 'Sanctuary Ritual'}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-sans text-brand-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {req.booking_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {req.start_time} {req.end_time ? `– ${req.end_time}` : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {req.gender || 'Grooming'}
                          </span>
                        </div>
                        {req.notes && (
                          <p className="font-sans text-[11px] text-brand-text-muted italic bg-brand-bg/40 p-2 border border-brand-accent/20 break-words">
                            Note: "{req.notes}"
                          </p>
                        )}
                        <p className="font-sans text-[11px] text-brand-text-muted leading-relaxed">
                          Registered Concierge Request • Quote reference <strong className="text-brand-primary font-mono font-bold">#{req.id}</strong> to salon front-desk to finalize timing.
                        </p>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-brand-surface-muted pt-3 md:pt-0 gap-2 shrink-0">
                        <span className="font-serif text-xl font-bold text-brand-gold-dark">
                          ₹{req.total_amount}
                        </span>
                        {req.payment_status === 'paid' ? (
                          <span className="font-sans text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 uppercase tracking-wider font-semibold flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Verified Online
                          </span>
                        ) : (
                          <span className="font-sans text-[10px] text-brand-text-muted uppercase tracking-wider">
                            Pay upon salon arrival
                          </span>
                        )}
                        {req.razorpay_payment_id && (
                          <span className="font-mono text-[9px] text-brand-text-muted truncate max-w-[150px]">
                            Ref: {req.razorpay_payment_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-brand-surface border border-dashed border-brand-accent p-6 sm:p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
              <div className="h-12 w-12 rounded-none bg-brand-surface-muted flex items-center justify-center text-brand-text-muted mb-4 border border-brand-accent">
                <Clock className="h-5 w-5" />
              </div>
              <p className="font-serif text-lg font-medium text-brand-primary">No Concierge Requests Logged</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-sm mt-1.5 leading-relaxed">
                When you initiate a scheduling request through the reservations desk, your requests will appear here with live review tracking and front-desk reference codes.
              </p>
            </div>
          )
        ) : sortedAppointments.length > 0 ? (
          <div className="space-y-4">
            {sortedAppointments.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-brand-surface border border-brand-accent p-4 sm:p-6 hover:border-brand-secondary/40 transition-all duration-300 relative group"
              >
                {/* Visual state accent */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    app.status === 'upcoming'
                      ? 'bg-brand-secondary'
                      : app.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-red-400'
                  }`}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Left: Info */}
                  <div className="flex gap-3 sm:gap-4 items-center min-w-0 w-full sm:w-auto">
                    <img
                      src={app.stylistAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100'}
                      alt={app.stylistName}
                      className="h-12 w-12 border border-brand-accent rounded-none object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-brand-text-muted font-bold truncate">
                          {app.id}
                        </span>
                        <span className="bg-brand-surface-muted text-brand-text-muted font-mono text-[8px] uppercase px-1.5 py-0.5 border border-brand-accent shrink-0">
                          {app.category}
                        </span>
                      </div>
                      <h4 className="font-serif text-base sm:text-lg font-medium text-brand-primary mt-1 truncate">
                        {app.serviceName}
                      </h4>
                      {app.services && app.services.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.services.map((s, idx) => (
                            <span key={idx} className="font-sans text-[10px] bg-brand-surface border border-brand-accent px-1.5 py-0.5 rounded text-brand-text">
                              {s.name} ({typeof s.price === 'number' ? `₹${s.price}` : s.price})
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="font-sans text-xs text-brand-text-muted mt-0.5 truncate">
                        Senior Artist: <span className="text-brand-primary font-medium">{app.stylistName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Scheduled Details */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 sm:gap-1 font-sans text-xs text-brand-text-muted w-full md:w-auto border-t md:border-t-0 border-brand-surface-muted/60 pt-2.5 md:pt-0">
                    <div className="flex items-center gap-1.5 font-serif text-sm font-semibold text-brand-primary">
                      <Calendar className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {app.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {app.timeSlot} ({app.duration})
                    </div>
                  </div>

                  {/* Right: Payment Status & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-brand-surface-muted pt-3.5 md:pt-0 w-full md:w-auto">
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span className="font-serif text-base font-medium text-brand-primary block">
                        ${app.price.toFixed(2)}
                      </span>
                      <span className="font-mono text-[9px] uppercase font-bold text-brand-gold-dark block">
                        {app.paymentStatus === 'paid' ? '● Fully Prepaid' : '○ Counter Pay'}
                      </span>
                      {app.realStatus && (
                        <span className="font-mono text-[9px] uppercase font-bold text-brand-secondary block mt-0.5">
                          Status: {app.realStatus}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 xs:flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                      <Button
                        id={`app-detail-trigger-${app.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDetailAppointment(app)}
                        className="font-sans text-[10px] uppercase font-semibold py-2 px-3 border-brand-accent hover:border-brand-secondary flex-1 xs:flex-initial text-center justify-center"
                      >
                        Details
                      </Button>

                      {app.status === 'upcoming' && (
                        <>
                          <Button
                            id={`app-resched-trigger-${app.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setActiveReschedule(app);
                              setNewDate(app.date);
                              setNewTime(app.timeSlot);
                            }}
                            className="font-sans text-[10px] uppercase font-semibold py-2 px-3 flex-1 xs:flex-initial text-center justify-center"
                          >
                            Reschedule
                          </Button>
                          {(!app.realStatus || app.realStatus === 'pending') && (
                            <Button
                              id={`app-cancel-trigger-${app.id}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveCancelConfirm(app)}
                              className="font-sans text-[10px] uppercase font-semibold text-red-500 hover:bg-red-50 py-2 px-3 rounded-none col-span-2 xs:col-span-1 flex-1 xs:flex-initial text-center justify-center"
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-brand-surface border border-dashed border-brand-accent p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
            <div className="h-12 w-12 rounded-none bg-brand-surface-muted flex items-center justify-center text-brand-text-muted mb-4 border border-brand-accent">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="font-serif text-lg font-medium text-brand-primary">No Matching Appointments</p>
            <p className="font-sans text-xs text-brand-text-muted max-w-sm mt-1.5">
              We couldn't detect any appointments matching this category or keywords. Try resetting your filter queries.
            </p>
          </div>
        )}
      </div>

      {/* ==============================================
          APPOINTMENT TICKET DETAIL MODAL (with QR Code)
          ============================================== */}
      <Modal
        id="appointment-ticket-modal"
        isOpen={activeDetailAppointment !== null}
        onClose={() => setActiveDetailAppointment(null)}
        title="Royal Access Ticket"
        size="md"
      >
        {activeDetailAppointment && (
          <div className="space-y-6 pt-2 pb-4">
            {/* Ticket Header QR layout */}
            <div className="bg-[#FAF7F0] text-brand-text p-6 border border-[#E6DCCB] rounded-2xl relative text-center shadow-sm">
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#B88A45_1px,transparent_1px)] bg-[size:1rem_1rem]" />
              
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-bold block mb-1">
                TICKET SECURE PASS
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#211D18]">
                {activeDetailAppointment.serviceName}
              </h3>
              <p className="font-mono text-[10px] text-brand-secondary mt-1 font-semibold">
                ID: {activeDetailAppointment.id}
              </p>

              {/* All individual selected services */}
              {activeDetailAppointment.services && activeDetailAppointment.services.length > 0 && (
                <div className="text-left bg-white border border-[#E6DCCB] rounded-xl p-3.5 my-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-[#E6DCCB] pb-1.5">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-[#B88A45] font-bold">
                      All Individual Services ({activeDetailAppointment.services.length})
                    </span>
                    <span className="font-sans text-xs text-[#746B60]">
                      Combined Duration: <strong className="text-[#211D18]">{activeDetailAppointment.duration}</strong>
                    </span>
                  </div>
                  <div className="divide-y divide-[#E6DCCB]/60 space-y-1">
                    {activeDetailAppointment.services.map((srv, idx) => (
                      <div key={idx} className="pt-1.5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-serif font-bold text-[#211D18]">{srv.name}</span>
                          {srv.category && (
                            <span className="text-[9px] text-[#746B60] ml-1.5 px-1 py-0.5 rounded bg-[#FAF7F0] border border-[#E6DCCB]">
                              {srv.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-serif font-bold text-[#211D18]">
                            {typeof srv.price === 'number' ? `₹${srv.price}` : srv.price}
                          </span>
                          <span className="text-[10px] text-[#746B60] ml-1">
                            ({typeof srv.duration === 'number' ? `${srv.duration} Mins` : srv.duration})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code Placeholder Box */}
              <div className="bg-white border border-[#E6DCCB] p-4 h-36 w-36 mx-auto my-5 flex flex-col items-center justify-center shadow-md rounded-xl relative group">
                <QrCode className="h-28 w-28 text-brand-secondary stroke-[1.25]" />
                <div className="absolute inset-0 bg-white/95 text-[#211D18] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <span className="font-sans text-[8px] uppercase tracking-widest font-semibold mb-1">Priority Scanner</span>
                  <span className="font-mono text-[9px] font-bold text-brand-secondary">MSH-SECURE-99</span>
                </div>
              </div>

              <p className="font-sans text-[10px] text-[#746B60] max-w-xs mx-auto leading-relaxed">
                Present this QR ticket pass at the concierge desk upon priority arrival for instant check-in.
              </p>
            </div>

            {/* Treatment Specifications */}
            <div className="grid grid-cols-2 gap-4 border-b border-brand-accent pb-5">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  SERVICE ARTIST
                </span>
                <p className="font-serif text-base font-semibold text-brand-primary mt-1">
                  {activeDetailAppointment.stylistName}
                </p>
              </div>
              <div>
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  TREATMENT ROOM
                </span>
                <p className="font-serif text-base font-semibold text-brand-primary mt-1 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-secondary" /> Sovereign Salon Suite 4
                </p>
              </div>
              <div className="mt-2">
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  SCHEDULED SLOT
                </span>
                <p className="font-serif text-sm font-semibold text-brand-primary mt-1">
                  {activeDetailAppointment.date}
                </p>
                <p className="font-sans text-xs text-brand-text-muted mt-0.5">
                  {activeDetailAppointment.timeSlot} ({activeDetailAppointment.duration})
                </p>
              </div>
              <div className="mt-2">
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  BILLING DETAILS
                </span>
                <p className="font-serif text-sm font-semibold text-brand-primary mt-1">
                  ${activeDetailAppointment.price.toFixed(2)}
                </p>
                <p className="font-mono text-[9px] font-bold text-brand-gold-dark mt-0.5 uppercase">
                  {activeDetailAppointment.paymentStatus === 'paid' ? 'Paid via Wallet' : 'Pay On Location'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse xs:flex-row gap-2.5 justify-end pt-1">
              <Button
                id="ticket-download-invoice-btn"
                variant="outline"
                size="md"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleDownloadInvoice(activeDetailAppointment)}
                className="w-full xs:w-auto font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary py-2.5"
              >
                Invoice Receipt
              </Button>
              <Button
                id="ticket-close-btn"
                variant="primary"
                size="md"
                onClick={() => setActiveDetailAppointment(null)}
                className="w-full xs:w-auto font-sans text-[10px] uppercase tracking-wider font-semibold px-6 py-2.5"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==============================================
          APPOINTMENT CANCEL CONFIRM DIALOG
          ============================================== */}
      <Modal
        id="cancel-confirmation-modal"
        isOpen={activeCancelConfirm !== null}
        onClose={() => setActiveCancelConfirm(null)}
        title="Confirm Session Release"
        size="sm"
      >
        {activeCancelConfirm && (
          <div className="space-y-4 pt-2 pb-4 text-center">
            <div className="h-12 w-12 bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto rounded-none">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div>
              <p className="font-serif text-lg font-semibold text-brand-primary">Release this Appointment?</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto mt-2 leading-relaxed">
                Are you sure you wish to cancel your scheduled slot for <strong className="text-brand-primary">{activeCancelConfirm.serviceName}</strong> with <strong className="text-brand-primary">{activeCancelConfirm.stylistName}</strong>?
              </p>
              <p className="font-sans text-[10px] text-brand-gold-dark bg-brand-gold-light border border-brand-secondary/35 p-2.5 mt-3 leading-relaxed">
                Credits of ${activeCancelConfirm.price.toFixed(2)} will be refunded instantly back into your personal salon wallet.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-3">
              <Button
                id="cancel-deny-btn"
                variant="outline"
                size="md"
                onClick={() => setActiveCancelConfirm(null)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
              >
                Keep Booking
              </Button>
              <Button
                id="cancel-approve-btn"
                variant="primary"
                size="md"
                onClick={handleConfirmCancel}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold bg-red-600 hover:bg-red-700 text-white border-none flex-1"
              >
                Yes, Release Slot
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==============================================
          APPOINTMENT RESCHEDULE CONTROL SHEET
          ============================================== */}
      <Modal
        id="reschedule-modal"
        isOpen={activeReschedule !== null}
        onClose={() => setActiveReschedule(null)}
        title="Reschedule Slot"
        size="md"
      >
        {activeReschedule && (
          <form onSubmit={handleConfirmRescheduleSubmit} id="reschedule-form" className="space-y-5 pt-2 pb-4">
            <div className="bg-brand-surface-muted p-4 border border-brand-accent">
              <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                CURRENT APPOINTMENT
              </span>
              <h4 className="font-serif text-base font-semibold text-brand-primary mt-1">
                {activeReschedule.serviceName}
              </h4>
              <p className="font-sans text-xs text-brand-text-muted mt-0.5">
                Stylist: {activeReschedule.stylistName} | Slot: {activeReschedule.date} at {activeReschedule.timeSlot}
              </p>
            </div>

            {/* Select Date */}
            <div>
              <label htmlFor="reschedule-date" className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2 block">
                Choose New Date
              </label>
              <input
                id="reschedule-date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-brand-surface text-brand-text px-4 py-3 border border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none font-sans text-sm"
              />
            </div>

            {/* Select Time Slot Grid */}
            <div>
              <span className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2.5 block">
                Select Available Hour
              </span>
              {timeSlots.length === 0 ? (
                <p className="font-sans text-xs text-brand-text-muted italic py-2">
                  Availability unavailable
                </p>
              ) : (
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = slot === newTime;
                    return (
                      <button
                        key={slot}
                        type="button"
                        id={`reschedule-time-slot-${slot.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setNewTime(slot)}
                        className={`py-2.5 px-2 border text-center font-sans text-xs transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'border-brand-secondary bg-brand-gold-light text-brand-gold-dark font-bold'
                            : 'border-brand-accent hover:border-brand-secondary bg-brand-surface text-brand-text'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse xs:flex-row gap-2.5 justify-end pt-3">
              <Button
                id="reschedule-cancel-btn"
                type="button"
                variant="outline"
                size="md"
                onClick={() => setActiveReschedule(null)}
                className="w-full xs:w-auto font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary py-2.5"
              >
                Discard
              </Button>
              <Button
                id="reschedule-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                className="w-full xs:w-auto font-sans text-[10px] uppercase tracking-wider font-semibold px-6 py-2.5"
              >
                Confirm Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
