'use client';

import { createContext } from 'react';
import type { ThemeValue } from './Theme.js';
import type { ThemePreference } from './ThemeBootstrap.js';

export interface ThemePreferenceValue {
  /** The stored choice. */
  preference: ThemePreference;
  /** The theme in use after resolving "system". */
  theme: ThemeValue;
  setPreference: (preference: ThemePreference) => void;
  /** Store the opposite of the current theme. */
  toggleTheme: () => void;
}

/**
 * The nearest ThemePreferenceProvider's preference, or null outside one. ThemePreferenceProvider
 * provides it; components that work with or without a provider, such as ThemeRadioGroup, read it.
 */
export const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);
