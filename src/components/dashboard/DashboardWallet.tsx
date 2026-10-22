/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Luxury Unisex Saloon — Customer Wallet & Transactions
 * 
 * Design System: Bright Creamy Luxury
 * - Background: Warm Ivory (#FAF7F0)
 * - Cards: Pure White (#FFFFFF), Rounded (#E6DCCB borders)
 * - Headings: Playfair Display
 * - Body: Plus Jakarta Sans
 * - ₹ INR formatting everywhere, never dollars
 * - Real transactions only, with graceful empty state
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  CreditCard,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building,
  QrCode,
  IndianRupee
} from 'lucide-react';
import { WalletTransaction } from './types';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';

interface DashboardWalletProps {
  id: string;
  walletBalance: number;
  transactions: WalletTransaction[];
  onAddFunds: (amount: number) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardWallet({
  id,
  walletBalance,
  transactions,
  onAddFunds,
  triggerToast
}: DashboardWalletProps) {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  // Predefined Indian Rupee Bundles
  const bundles = [
    { value: 500, bonus: 50, label: 'Bronze Credit' },
    { value: 1000, bonus: 150, label: 'Royal Silver Credit' },
    { value: 2500, bonus: 450, label: 'Imperial Gold' },
    { value: 5000, bonus: 1000, label: 'Sovereign Patron' },
  ];

  const [selectedBundle, setSelectedBundle] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'desk'>('upi');

  const handleAddFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topUpAmount = customAmount ? parseFloat(customAmount) : selectedBundle;

    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      triggerToast('error', 'Invalid Amount', 'Please select a bundle or enter a valid amount in ₹ INR.');
      return;
    }

    if (topUpAmount < 100) {
      triggerToast('error', 'Minimum Deposit', 'The minimum wallet pre-payment is ₹ 100.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onAddFunds(topUpAmount);

      triggerToast(
        'success',
        'Wallet Funded Successfully',
        `₹ ${topUpAmount.toLocaleString('en-IN')} has been added to your Musha Empire account balance.`
      );

      setIsAddFundsOpen(false);
      setCustomAmount('');
    }, 1000);
  };

  const formattedBalance = `₹ ${(walletBalance || 0).toLocaleString('en-IN')}`;

  return (
    <div id={id} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Main Wallet Banner Card */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_rgba(33,29,24,0.03)] relative overflow-hidden">
        {/* Subtle warm champagne-gold ambient glow */}
        <div
          className="absolute -top-16 -right-16 w-80 h-80 bg-[#B88A45]/[0.08] rounded-full blur-[80px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-[#B88A45] inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> EMPIRE PRE-PAID PRIVILEGE
            </span>
            <p className="text-xs uppercase font-sans tracking-wider text-[#746B60] font-semibold">
              Available Wallet Balance
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#211D18] mt-1">
              {formattedBalance}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#746B60] mt-2 max-w-md leading-relaxed">
              Use your pre-funded credit for seamless checkout at the salon reception desk,
              hair rituals, beard styling, and private spa treatments.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row gap-3 w-full md:w-auto shrink-0">
            <Button
              id="wallet-add-funds-btn"
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsAddFundsOpen(true)}
              className="bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-7 font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
            >
              Top Up Wallet
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#E6DCCB]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-sm">
              ⚡
            </div>
            <div className="text-xs">
              <span className="font-semibold text-[#211D18] block">Instant Desk Deduction</span>
              <span className="text-[#746B60]">Zero wait time at checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-sm">
              🎁
            </div>
            <div className="text-xs">
              <span className="font-semibold text-[#211D18] block">Bonus Treatment Credits</span>
              <span className="text-[#746B60]">Up to ₹1,000 complimentary</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-sm">
              🛡️
            </div>
            <div className="text-xs">
              <span className="font-semibold text-[#211D18] block">100% Encrypted &amp; Safe</span>
              <span className="text-[#746B60]">Secured by Firebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Transaction Records List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211D18]">
            Transaction Records
          </h2>
          <span className="text-xs font-sans text-[#746B60]">
            {transactions.length} record{transactions.length === 1 ? '' : 's'} found
          </span>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="bg-white border border-[#E6DCCB] rounded-2xl shadow-[0_4px_20px_rgba(33,29,24,0.02)] divide-y divide-[#E6DCCB]/60 overflow-hidden">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#FAF7F0]/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCredit
                          ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]'
                          : 'bg-[#FAF7F0] border-[#E6DCCB] text-[#746B60]'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-serif font-bold text-sm sm:text-base text-[#211D18] truncate">
                        {tx.description}
                      </p>
                      <p className="font-sans text-xs text-[#746B60] mt-0.5 flex items-center gap-2">
                        <span>{tx.date}</span>
                        <span className="text-[#E6DCCB]">·</span>
                        <span className="font-mono text-[10px]">{tx.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-serif text-base sm:text-lg font-bold block ${
                        isCredit ? 'text-[#34A853]' : 'text-[#211D18]'
                      }`}
                    >
                      {isCredit ? '+' : '-'} ₹ {tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="font-sans text-[10px] uppercase font-semibold text-[#746B60] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#E6DCCB] inline-block mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Graceful Empty State (Zero dummy records) */
          <div
            id="wallet-empty-state"
            className="bg-white border border-[#E6DCCB] rounded-2xl p-8 sm:p-10 text-center shadow-[0_4px_20px_rgba(33,29,24,0.02)]"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF7F0] border border-[#E6DCCB] flex items-center justify-center text-2xl mb-4">
              💳
            </div>
            <h3 className="font-serif text-xl font-bold text-[#211D18]">
              No Transactions Recorded Yet
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#746B60] max-w-md mx-auto mt-2 leading-relaxed">
              Your wallet statement is clean. Once you top up funds or settle appointments at the
              Musha Empire salon desk, your itemized receipts will be logged here.
            </p>
            <div className="mt-6">
              <Button
                id="empty-wallet-topup-btn"
                variant="primary"
                size="md"
                onClick={() => setIsAddFundsOpen(true)}
                className="bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-7 font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
              >
                Top Up Balance
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Top Up Balance Modal */}
      <Modal
        id="wallet-add-funds-modal"
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        title="Top Up Empire Wallet (₹ INR)"
        size="md"
      >
        <form onSubmit={handleAddFundsSubmit} id="add-funds-form" className="space-y-6 pt-2 pb-4">
          <div>
            <span className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-3">
              Select Pre-Payment Bundle
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bundles.map((b) => {
                const isSelected = selectedBundle === b.value && !customAmount;
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => {
                      setSelectedBundle(b.value);
                      setCustomAmount('');
                    }}
                    className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#B88A45] bg-[#FAF7F0] shadow-xs'
                        : 'border-[#E6DCCB] hover:border-[#B88A45]/40 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-sans text-[11px] uppercase font-semibold text-[#746B60] block">
                        {b.label}
                      </span>
                      <span className="font-serif text-xl font-bold text-[#211D18] mt-0.5 block">
                        ₹ {b.value.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="bg-[#B88A45] text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      +₹{b.bonus} Bonus
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label
              htmlFor="custom-add-amount"
              className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-1.5"
            >
              Or Enter Custom Sum (₹ INR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-serif text-lg text-[#211D18] font-bold">₹</span>
              <input
                id="custom-add-amount"
                type="number"
                min="100"
                step="50"
                placeholder="e.g. 1500"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedBundle(0);
                }}
                className="w-full bg-white text-[#211D18] pl-9 pr-4 py-3 font-sans border border-[#E6DCCB] rounded-xl focus:border-[#B88A45] focus:ring-1 focus:ring-[#B88A45] outline-none font-semibold text-sm"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="block font-sans text-xs uppercase tracking-wider font-semibold text-[#211D18] mb-2">
              Payment Settlement Option
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-center font-sans text-xs font-semibold cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#B88A45] bg-[#FAF7F0] text-[#211D18]'
                    : 'border-[#E6DCCB] bg-white text-[#746B60] hover:border-[#B88A45]/40'
                }`}
              >
                UPI / GPay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center font-sans text-xs font-semibold cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#B88A45] bg-[#FAF7F0] text-[#211D18]'
                    : 'border-[#E6DCCB] bg-white text-[#746B60] hover:border-[#B88A45]/40'
                }`}
              >
                Credit / Debit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('desk')}
                className={`p-3 rounded-xl border text-center font-sans text-xs font-semibold cursor-pointer transition-all ${
                  paymentMethod === 'desk'
                    ? 'border-[#B88A45] bg-[#FAF7F0] text-[#211D18]'
                    : 'border-[#E6DCCB] bg-white text-[#746B60] hover:border-[#B88A45]/40'
                }`}
              >
                At Salon Desk
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse xs:flex-row gap-3 justify-end pt-3 border-t border-[#E6DCCB]">
            <Button
              id="add-funds-cancel-btn"
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddFundsOpen(false)}
              className="w-full xs:w-auto font-sans text-xs uppercase tracking-wider font-semibold border-[#E6DCCB] rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              id="add-funds-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isProcessing}
              className="w-full xs:w-auto bg-[#B88A45] hover:bg-[#A07435] text-white rounded-full px-8 font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
            >
              Authorize Pre-Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
