import type { ThemeContrast } from './Theme.js';

/** Preference stored by ThemePreferenceProvider: an explicit theme or the operating system's. */
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeBootstrapOptions {
  /** localStorage key shared with ThemePreferenceProvider. Defaults to "env-theme". */
  storageKey?: string;
  /** Used when nothing is stored. Defaults to "system". */
  defaultPreference?: ThemePreference;
  /**
   * The application's contrast, as ThemePreferenceProvider's `contrast`: `high` or `standard` is
   * written to the root as `data-env-contrast` before the first paint; `system`, the default,
   * writes nothing and leaves the choice to `prefers-contrast: more`. The script marks what it
   * writes with `data-env-contrast-source="bootstrap"`, so ThemePreferenceProvider treats it as its
   * own: once the application starts, the provider's contrast replaces it, and a provider at
   * `system` removes it.
   */
  contrast?: ThemeContrast;
}

export const defaultThemeStorageKey = 'env-theme';

/**
 * Marks a root `data-env-contrast` the bootstrap script wrote, so that ThemePreferenceProvider
 * replaces or removes it as its own rather than leaving it as one the page set.
 */
export const contrastSourceAttribute = 'data-env-contrast-source';
export const bootstrapContrastSource = 'bootstrap';

/**
 * Inline script for the document head. It themes the root element before the first paint, so a
 * saved or system dark theme does not flash light while the application loads, and a high or
 * standard contrast applies from the start.
 */
export function createThemeBootstrapScript({
  storageKey = defaultThemeStorageKey,
  defaultPreference = 'system',
  contrast = 'system',
}: ThemeBootstrapOptions = {}) {
  const writeContrast =
    contrast === 'high' || contrast === 'standard'
      ? `r.setAttribute("data-env-contrast",${JSON.stringify(contrast)});r.setAttribute(${JSON.stringify(contrastSourceAttribute)},${JSON.stringify(bootstrapContrastSource)});`
      : '';
  return `(function(){var r=document.documentElement,t="light";try{var p=localStorage.getItem(${JSON.stringify(storageKey)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(defaultPreference)};t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);${writeContrast}r.style.colorScheme=t})();`;
}
