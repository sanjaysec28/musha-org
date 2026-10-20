/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Luxury Theme Toggle (Sun / Moon)
 * Seamlessly transitions between Bright Creamy Luxury and Dark Luxury.
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ThemeToggleProps {
  id?: string;
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle(_props: ThemeToggleProps) {
  // Theme toggle removed: Bright Creamy Luxury is permanently enabled.
  return null;
}
