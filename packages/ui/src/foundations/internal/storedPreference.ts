import type { ThemePreference } from '../themeBootstrap.js';
import { isOneOf, themePreferences } from '../../internal/theme/themeRoot.js';

export const defaultThemeStorageKey = 'env-theme';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  isOneOf(themePreferences, value);
