import {
  themeBootstrapScript,
  type ThemeDefinition,
  type ThemePreference,
} from './themeBootstrap.js';
import { isOneOf, themePreferences } from '../internal/theme/themeRoot.js';

/** Where the browser keeps the theme preference: the same for the hook and the head script. */
export interface ThemeStorageOptions {
  /**
   * The localStorage key the preference is kept under.
   * @default 'env-theme'
   */
  storageKey?: string;
  /**
   * The preference while nothing is stored.
   * @default 'system'
   */
  defaultPreference?: ThemePreference;
}

export const defaultThemeStorageKey = 'env-theme';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  isOneOf(themePreferences, value);

/**
 * Inline script for the document head of an application that keeps the theme preference with
 * useStoredThemePreference: createThemeBootstrapScript's script, with the preference stored in
 * localStorage, so a stored dark theme does not flash light while the application loads.
 */
export function createStoredThemeBootstrapScript(
  theme: ThemeDefinition = {},
  { storageKey = defaultThemeStorageKey, defaultPreference = 'system' }: ThemeStorageOptions = {},
) {
  return themeBootstrapScript(
    theme,
    `var p=localStorage.getItem(${JSON.stringify(storageKey)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(defaultPreference)};`,
  );
}
