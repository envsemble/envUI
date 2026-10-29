'use client';

import { createContext } from 'react';
import type { ColorScheme } from '../Theme.js';
import type { ThemePreference } from '../themeBootstrap.js';

export interface ThemePreferenceValue {
  /** The stored choice. */
  preference: ThemePreference;
  /** The theme in use after resolving "system". */
  theme: ColorScheme;
  setPreference: (preference: ThemePreference) => void;
  /** Store the opposite of the current theme. */
  toggleTheme: () => void;
}

/**
 * The nearest ThemePreferenceProvider's preference, or null outside one. ThemePreferenceProvider
 * provides it; components that work with or without a provider, such as ThemeMenuRadioGroup, read it.
 */
export const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);
