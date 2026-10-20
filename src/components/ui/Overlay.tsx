/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps, DrawerProps } from '../../types';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  id,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Luxury sizes
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-0 h-full',
  };

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div id={`${id}-wrapper`} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            id={`${id}-backdrop`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            id={id}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.1 } as any}
            className={`relative w-full ${sizes[size]} bg-brand-surface rounded-2xl border border-brand-accent shadow-2xl z-10 overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div id={`${id}-header`} className="px-6 py-5 border-b border-brand-accent bg-brand-surface flex items-start justify-between">
              <div>
                <h3 id={`${id}-title`} className="text-xl md:text-2xl font-serif text-brand-primary">
                  {title}
                </h3>
                {description && (
                  <p id={`${id}-desc`} className="text-brand-text-muted text-xs font-sans mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                id={`${id}-close`}
                onClick={onClose}
                className="text-brand-text-muted hover:text-brand-primary transition-colors p-2 -mr-2 rounded-lg hover:bg-white/[0.08] active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div id={`${id}-content`} className="px-6 py-6 overflow-y-auto overscroll-contain max-h-[60vh] text-brand-text font-sans text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div id={`${id}-footer`} className="px-6 py-4 border-t border-brand-secondary/15 bg-brand-surface-muted/50 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  id,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Directional slide offsets
  const isRight = position === 'right';
  const motionProps = {
    initial: { x: isRight ? '100%' : '-100%' },
    animate: { x: 0 },
    exit: { x: isRight ? '100%' : '-100%' },
    transition: { type: 'spring', damping: 25, stiffness: 220 } as any,
  };

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div id={`${id}-wrapper`} className="fixed inset-0 z-[100] flex overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            id={`${id}-backdrop`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-md cursor-pointer select-none"
          />

          {/* Drawer Container - Solid Luxury Panel */}
          <motion.div
            id={id}
            {...motionProps}
            className={`fixed inset-y-0 ${isRight ? 'right-0' : 'left-0'} w-full sm:max-w-md bg-[#FAF7F0] border-l border-[#E6DCCB] shadow-[-8px_0_40px_rgba(33,29,24,0.12)] z-10 flex flex-col h-full max-h-[100dvh] overflow-hidden`}
          >
            {/* Header */}
            <div id={`${id}-header`} className="shrink-0 sticky top-0 z-20 px-6 py-4 sm:py-5 border-b border-[#E6DCCB] bg-[#FAF7F0] flex items-center justify-between">
              <h3 id={`${id}-title`} className="text-lg sm:text-xl font-serif text-[#211D18] uppercase tracking-wider font-bold">
                {title}
              </h3>
              <button
                id={`${id}-close`}
                onClick={onClose}
                className="text-[#211D18] hover:text-brand-secondary transition-colors p-2 -mr-2 rounded-lg hover:bg-black/5 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div id={`${id}-content`} className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 sm:py-6 text-brand-text font-sans text-sm leading-relaxed touch-pan-y bg-[#FAF7F0]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div id={`${id}-footer`} className="shrink-0 px-6 py-4 border-t border-brand-secondary/15 bg-brand-surface-muted/50 flex flex-col gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
