/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Centralized Theme Context & System
 * Supports Bright Creamy Luxury (Default) and Dark Luxury themes.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type ThemeMode = 'light';

export interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isLight: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Permanent Bright Creamy Luxury theme
  const theme: ThemeMode = 'light';

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.removeItem('musha_theme_mode');
    } catch (e) {
      console.warn('Theme initialization note:', e);
    }
  }, []);

  const setTheme = () => {
    // Permanent Bright Creamy Luxury theme
  };

  const toggleTheme = () => {
    // Permanent Bright Creamy Luxury theme
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isLight: true,
      isDark: false,
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
