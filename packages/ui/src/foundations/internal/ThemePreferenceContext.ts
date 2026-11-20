'use client';

import { createContext } from 'react';
import type { ColorScheme } from '../Theme.js';
import type { ThemePreference } from '../themeBootstrap.js';

/** What useThemePreference returns: the preference, the theme in use, and how to change them. */
export interface ThemePreferenceValue {
  /** The chosen preference. */
  preference: ThemePreference;
  /** The theme in use after resolving "system". */
  theme: ColorScheme;
  /** Choose a preference: system, light or dark. */
  setPreference: (preference: ThemePreference) => void;
  /** Choose the opposite of the current theme. */
  toggleTheme: () => void;
}

/**
 * The nearest ThemePreferenceProvider's preference, or null outside one. ThemePreferenceProvider
 * provides it; components that work with or without a provider, such as ThemeMenuRadioGroup, read it.
 */
export const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);
