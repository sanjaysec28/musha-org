/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Customer Profile & Settings
 * 
 * Design System: Bright Creamy Luxury
 * - Background: Warm Ivory (#FAF7F0)
 * - Cards: Pure White (#FFFFFF), Rounded (#E6DCCB borders)
 * - Headings: Playfair Display
 * - Body: Plus Jakarta Sans
 * - Real Firebase/Firestore profile updates with validation
 * - Protected read-only fields
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Crown,
  Bell,
  Save,
  CheckCircle
} from 'lucide-react';
import { DashboardUser, UserAddress } from './types';
import { usersRepository } from '../../lib/firestoreService';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface DashboardProfileAndSettingsProps {
  id: string;
  user: DashboardUser;
  onUpdateUser: (updatedUser: Partial<DashboardUser>) => Promise<void> | void;
  onAddAddress?: (address: Omit<UserAddress, 'id'>) => void;
  onDeleteAddress?: (addressId: string) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardProfileAndSettings({
  id,
  user,
  onUpdateUser,
  triggerToast
}: DashboardProfileAndSettingsProps) {
  const { user: authUser, profile, refreshProfile } = useAuth();

  // Active view tab inside profile section
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Form fields
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [gender, setGender] = useState(user.gender || 'Universal / All Services');
  const [bio, setBio] = useState(user.bio || '');

  // Form validation errors
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  // Sync state if user prop changes while not actively editing
  useEffect(() => {
    if (!isEditing) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setGender(user.gender || 'Universal / All Services');
      setBio(user.bio || '');
    }
  }, [user, isEditing]);

  // App notification preferences
  const [reminders, setReminders] = useState(user.preferences?.appointmentReminders ?? true);
  const [smsNotifs, setSmsNotifs] = useState(user.preferences?.smsNotifications ?? false);
  const [newsletter, setNewsletter] = useState(user.preferences?.newsletter ?? true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Copy UID helper
  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    triggerToast('info', 'Member ID Copied', 'Your unique reference ID has been copied to your clipboard.');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Please provide your full legal name.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      // Basic phone format validation: allow +, digits, spaces, hyphens, min 8 digits
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (e.g. +91 98666 68715).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Cancel Edits
  const handleCancelEdit = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setGender(user.gender || 'Universal / All Services');
    setBio(user.bio || '');
    setErrors({});
    setIsEditing(false);
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerToast('error', 'Validation Error', 'Please check the required fields before saving.');
      return;
    }

    setIsSaving(true);
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const selectedGender = gender;
    const trimmedBio = bio.trim();

    try {
      const targetUid = authUser?.uid || auth.currentUser?.uid || user.id;

      // 1. Real Firebase updates if Firebase is configured
      if (isFirebaseConfigured && targetUid) {
        // Update Firestore users collection (supported non-protected fields)
        await usersRepository.update(targetUid, {
          fullName: trimmedName,
          full_name: trimmedName,
          phone: trimmedPhone,
          updatedAt: new Date().toISOString()
        });

        // Update Firebase Auth user displayName if changed
        if (auth.currentUser && auth.currentUser.displayName !== trimmedName) {
          try {
            await updateProfile(auth.currentUser, {
              displayName: trimmedName
            });
          } catch (authErr) {
            console.warn('Notice updating auth displayName:', authErr);
          }
        }

        // Trigger context refresh to keep state synchronized
        if (refreshProfile) {
          await refreshProfile();
        }
      }

      // 2. Dispatch local state update in DashboardModule
      await onUpdateUser({
        name: trimmedName,
        phone: trimmedPhone,
        gender: selectedGender,
        bio: trimmedBio
      });

      triggerToast('success', 'Profile Saved', 'Your identity details have been updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile to Firebase:', err);
      triggerToast('error', 'Save Failed', err.message || 'Could not update profile in Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Preferences Save
  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      const targetUid = authUser?.uid || auth.currentUser?.uid || user.id;
      const updatedPrefs = {
        ...user.preferences,
        appointmentReminders: reminders,
        smsNotifications: smsNotifs,
        newsletter
      };

      if (isFirebaseConfigured && targetUid) {
        await usersRepository.update(targetUid, {
          preferences: updatedPrefs,
          updatedAt: new Date().toISOString()
        });
      }

      await onUpdateUser({ preferences: updatedPrefs });
      triggerToast('success', 'Preferences Updated', 'Your communication preferences have been saved.');
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      triggerToast('error', 'Update Failed', 'Could not save preferences.');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const memberSinceFormatted = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
      })
    : '2026';

  const userInitials = (user.name || 'Patron')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div id={id} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(33,29,24,0.03)] relative overflow-hidden">
        {/* Ambient champagne gold aura */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 bg-[#B88A45]/[0.06] rounded-full blur-[60px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Patron Avatar with Champagne Gold Ring */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF7F0] border-2 border-[#B88A45]/40 p-1 flex items-center justify-center shadow-sm">
                {user.avatar && !user.avatar.includes('unsplash') ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FAF7F0] to-[#F1E9DC] flex items-center justify-center font-serif text-xl sm:text-2xl font-bold text-[#B88A45]">
                    {userInitials}
                  </div>
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-white border border-[#E6DCCB] rounded-full p-1 text-[#B88A45] shadow-xs"
                title="Verified Patron"
              >
                <Crown className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-[#B88A45] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> PRIVILEGE PATRON
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#211D18] tracking-tight mt-0.5">
                {user.name || 'Valued Patron'}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#746B60] mt-1 flex items-center gap-2 flex-wrap">
                <span>{user.email}</span>
                <span className="text-[#E6DCCB]">·</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#746B60]">
                  UID: {user.id ? `${user.id.slice(0, 10)}...` : 'AUTH-MEMBER'}
                </span>
                {user.id && (
                  <button
                    type="button"
                    onClick={() => handleCopyUid(user.id)}
                    aria-label="Copy member ID"
                    className="text-[#746B60] hover:text-[#B88A45] transition-colors p-0.5"
                  >
                    {copiedUid ? <Check className="w-3.5 h-3.5 text-[#34A853]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action in Header */}
          {!isEditing ? (
            <Button
              id="edit-profile-trigger-btn"
              variant="outline"
              size="md"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
              className="border-[#B88A45]/40 text-[#211D18] hover:border-[#B88A45] hover:text-[#B88A45] hover:bg-[#FAF7F0] rounded-full px-5 font-sans text-xs uppercase tracking-wider font-semibold"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-[#B88A45] bg-[#FAF7F0] px-3 py-1.5 rounded-full border border-[#B88A45]/30 font-medium flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Editing Mode Active
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-[#E6DCCB]/60">
          <button
            type="button"
            id="tab-profile-identity"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#FAF7F0] text-[#211D18] border border-[#B88A45]/40 shadow-xs'
                : 'text-[#746B60] hover:text-[#211D18]'
            }`}
          >
            👤 Identity Profile
          </button>
          <button
            type="button"
            id="tab-profile-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'bg-[#FAF7F0] text-[#211D18] border border-[#B88A45]/40 shadow-xs'
                : 'text-[#746B60] hover:text-[#211D18]'
            }`}
          >
            ⚙️ App Preferences
          </button>
        </div>
      </div>

      {/* 2. Main Tab Body */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {!isEditing ? (
            /* ====================================================
               A. VIEW MODE: LUXURY IDENTITY RECORD CARDS
               ==================================================== */
            <div className="space-y-6">
              {/* Core Identity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Legal Name */}
                <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(33,29,24,0.02)]">
                  <div className="flex items-center justify-between text-xs font-sans text-[#746B60] mb-2">
                    <span className="uppercase tracking-wider font-semibold">Full Legal Name</span>
                    <User className="w-4 h-4 text-[#B88A45]" />
                  </div>
                  <p className="font-serif text-lg sm:text-xl font-bold text-[#211D18]">
                    {user.name || 'Not configured'}
                  </p>
                  <p className="font-sans text-xs text-[#746B60] mt-1">
                    Used on your salon desk receipts and digital appointment passes.
                  </p>
                </div>

                {/* Primary Email (Protected) */}
                <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(33,29,24,0.02)] relative">
                  <div className="flex items-center justify-between text-xs font-sans text-[#746B60] mb-2">
                    <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      Account Email <Lock className="w-3 h-3 text-[#B88A45]" />
                    </span>
                    <Mail className="w-4 h-4 text-[#B88A45]" />
                  </div>
                  <p className="font-sans text-base sm:text-lg font-semibold text-[#211D18] truncate">
                    {user.email || 'No email attached'}
                  </p>
                  <p className="font-sans text-xs text-[#746B60] mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#34A853]" /> Protected authentication credential (Read-Only)
                  </p>
                </div>

                {/* Contact Phone Number */}
                <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(33,29,24,0.02)]">
                  <div className="flex items-center justify-between text-xs font-sans text-[#746B60] mb-2">
                    <span className="uppercase tracking-wider font-semibold">Contact Phone</span>
                    <Phone className="w-4 h-4 text-[#B88A45]" />
                  </div>
                  <p className="font-sans text-base sm:text-lg font-semibold text-[#211D18]">
                    {user.phone ? user.phone : 'No phone number provided'}
                  </p>
                  <p className="font-sans text-xs text-[#746B60] mt-1">
                    Used for concierge confirmation and reservation SMS reminders.
                  </p>
                </div>

                {/* Grooming Preference / Category */}
                <div className="bg-white border border-[#E6DCCB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(33,29,24,0.02)]">
                  <div className="flex items-center justify-between text-xs font-sans text-[#746B60] mb-2">
                    <span className="uppercase tracking-wider font-semibold">Grooming Preference</span>
                    <Sparkles className="w-4 h-4 text-[#B88A45]" />
                  </div>
                  <p className="font-serif text-lg sm:text-xl font-bold text-[#211D18]">
                    {user.gender || 'Universal / All Services'}
                  </p>
                  <p className="font-sans text-xs text-[#746B60] mt-1">
                    Tailors service recommendations and specialist artisan matching.
                  </p>
                </div>
              </div>

              {/* Personal Grooming Notes / Bio */}
              <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(33,29,24,0.02)]">
                <span className="font-sans text-xs uppercase tracking-wider font-semibold text-[#746B60] block mb-2">
                  Personal Styling Notes &amp; Preferences
                </span>
                {user.bio ? (
                  <p className="font-sans text-sm text-[#211D18] leading-relaxed whitespace-pre-line">
                    {user.bio}
                  </p>
                ) : (
                  <p className="font-sans text-sm text-[#746B60] italic">
                    No specific allergies, hair sensitivities, or artisan preferences recorded yet.
                    Click "Edit Profile" to add custom styling instructions.
                  </p>
                )}
              </div>

              {/* Account Security & Protected Data Strip */}
              <div className="bg-[#FAF7F0] border border-[#E6DCCB] rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#B88A45] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#211D18]">
                      Protected Account Records
                    </h3>
                    <p className="font-sans text-xs text-[#746B60] mt-1 leading-relaxed">
                      To safeguard member privileges and prevent unauthorized role changes, your verified email address,
                      member UID, and wallet balance cannot be modified through the customer profile editor.
                      For credential transfers or contact desk assistance, speak with our concierge staff.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#E6DCCB]/60 text-xs">
                      <div>
                        <span className="text-[#746B60] block">Account Status</span>
                        <span className="font-semibold text-[#211D18] flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" /> Active
                        </span>
                      </div>
                      <div>
                        <span className="text-[#746B60] block">Member Since</span>
                        <span className="font-semibold text-[#211D18] mt-0.5 block">
                          {memberSinceFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#746B60] block">Privilege Tier</span>
                        <span className="font-semibold text-[#B88A45] mt-0.5 block">
                          {user.membershipPlan || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#746B60] block">Wallet Balance</span>
                        <span className="font-semibold text-[#211D18] mt-0.5 block">
                          ₹ {(user.walletBalance || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ====================================================
               B. EDIT MODE: FUNCTIONAL PROFILE FORM WITH VALIDATION
               ==================================================== */
            <form
              id="edit-profile-form"
              onSubmit={handleSaveProfile}
              className="bg-white border border-[#B88A45]/30 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(33,29,24,0.06)] space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DCCB]">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18]">
                    Modify Identity Records
                  </h2>
                  <p className="font-sans text-xs text-[#746B60] mt-0.5">
                    Update your supported profile details. Protected security credentials remain locked.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1.5 text-[#746B60] hover:text-[#211D18] rounded-full hover:bg-[#FAF7F0] transition-colors"
                  aria-label="Cancel editing"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name Input (Editable) */}
                <div>
                  <label
                    htmlFor="profile-input-name"
                    className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-1.5"
                  >
                    Full Legal Name <span className="text-[#EA4335]">*</span>
                  </label>
                  <input
                    id="profile-input-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl border bg-white font-sans text-sm text-[#211D18] outline-none transition-all ${
                      errors.name
                        ? 'border-[#EA4335] focus:ring-1 focus:ring-[#EA4335]'
                        : 'border-[#E6DCCB] focus:border-[#B88A45] focus:ring-1 focus:ring-[#B88A45]'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-[#EA4335] font-sans flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone Number Input (Editable) */}
                <div>
                  <label
                    htmlFor="profile-input-phone"
                    className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-1.5"
                  >
                    Contact Phone Number
                  </label>
                  <input
                    id="profile-input-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="+91 98666 68715"
                    className={`w-full px-4 py-3 rounded-xl border bg-white font-sans text-sm text-[#211D18] outline-none transition-all ${
                      errors.phone
                        ? 'border-[#EA4335] focus:ring-1 focus:ring-[#EA4335]'
                        : 'border-[#E6DCCB] focus:border-[#B88A45] focus:ring-1 focus:ring-[#B88A45]'
                    }`}
                  />
                  {errors.phone ? (
                    <p className="mt-1 text-xs text-[#EA4335] font-sans flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#746B60] font-sans">
                      Used for SMS confirmations and desk notifications.
                    </p>
                  )}
                </div>

                {/* Grooming Category / Gender (Editable) */}
                <div>
                  <label
                    htmlFor="profile-select-gender"
                    className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-1.5"
                  >
                    Primary Grooming Category
                  </label>
                  <select
                    id="profile-select-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E6DCCB] bg-white font-sans text-sm text-[#211D18] outline-none focus:border-[#B88A45] focus:ring-1 focus:ring-[#B88A45] transition-all cursor-pointer"
                  >
                    <option value="Men">Men (Barbering, Beard &amp; Haircut)</option>
                    <option value="Women">Women (Balayage, Styling &amp; Spa)</option>
                    <option value="Boy">Boy (Young Gentlemen Grooming)</option>
                    <option value="Girl">Girl (Junior Styling &amp; Hair Care)</option>
                    <option value="Other">Universal / Third Gender</option>
                  </select>
                </div>

                {/* Email (Protected - Read-Only) */}
                <div>
                  <label
                    htmlFor="profile-input-email"
                    className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#746B60] mb-1.5 flex items-center justify-between"
                  >
                    <span>Account Email Address</span>
                    <span className="text-[10px] text-[#B88A45] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read-Only
                    </span>
                  </label>
                  <input
                    id="profile-input-email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-[#E6DCCB] bg-[#FAF7F0] font-sans text-sm text-[#746B60] cursor-not-allowed select-none"
                  />
                  <p className="mt-1 text-[11px] text-[#746B60] font-sans">
                    Authentication email is locked for account security.
                  </p>
                </div>
              </div>

              {/* Personal Styling Bio / Notes (Editable) */}
              <div>
                <label
                  htmlFor="profile-input-bio"
                  className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-1.5"
                >
                  Personal Styling Notes &amp; Requests
                </label>
                <textarea
                  id="profile-input-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Sensitive scalp, prefer ammonia-free organic colors, prefer Arthur or Elena for haircut..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E6DCCB] bg-white font-sans text-sm text-[#211D18] outline-none focus:border-[#B88A45] focus:ring-1 focus:ring-[#B88A45] transition-all resize-y"
                />
              </div>

              {/* Form Action Controls: Save & Cancel Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E6DCCB]">
                <Button
                  id="edit-profile-cancel-btn"
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="w-full sm:w-auto border-[#E6DCCB] text-[#746B60] hover:text-[#211D18] hover:border-[#B88A45] rounded-full px-6 font-sans text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </Button>

                <Button
                  id="edit-profile-save-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-8 font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(33,29,24,0.03)] space-y-6">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18]">
              Communication &amp; Concierge Preferences
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#746B60] mt-1">
              Select how our private salon desk contacts you regarding session schedules and announcements.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Appointment Reminders Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#E6DCCB] bg-[#FAF7F0]/60">
              <div className="space-y-0.5">
                <span className="font-sans text-sm font-semibold text-[#211D18] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B88A45]" /> Appointment Reminders
                </span>
                <p className="font-sans text-xs text-[#746B60]">
                  Receive calendar alerts and digital ticket QR notifications 24 hours prior to appointment.
                </p>
              </div>
              <input
                id="pref-reminders-toggle"
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
                className="w-5 h-5 accent-[#B88A45] rounded cursor-pointer"
              />
            </div>

            {/* SMS Notifications Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#E6DCCB] bg-[#FAF7F0]/60">
              <div className="space-y-0.5">
                <span className="font-sans text-sm font-semibold text-[#211D18] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#B88A45]" /> Desk SMS Alerts
                </span>
                <p className="font-sans text-xs text-[#746B60]">
                  Receive live SMS updates if a stylist is ready early or if slot rescheduling is approved.
                </p>
              </div>
              <input
                id="pref-sms-toggle"
                type="checkbox"
                checked={smsNotifs}
                onChange={(e) => setSmsNotifs(e.target.checked)}
                className="w-5 h-5 accent-[#B88A45] rounded cursor-pointer"
              />
            </div>

            {/* Newsletter Dispatch */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#E6DCCB] bg-[#FAF7F0]/60">
              <div className="space-y-0.5">
                <span className="font-sans text-sm font-semibold text-[#211D18] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#B88A45]" /> Royal Gazette &amp; Seasonal Menus
                </span>
                <p className="font-sans text-xs text-[#746B60]">
                  Private invitations to seasonal wellness rituals and VIP master styling showcases.
                </p>
              </div>
              <input
                id="pref-newsletter-toggle"
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="w-5 h-5 accent-[#B88A45] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E6DCCB]">
            <Button
              id="save-preferences-btn"
              variant="primary"
              size="md"
              isLoading={isSavingPrefs}
              onClick={handleSavePreferences}
              className="bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-6 font-sans text-xs uppercase tracking-wider font-bold"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
