import type { ThemePreference } from '../themeBootstrap.js';

export const defaultThemeStorageKey = 'env-theme';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';
