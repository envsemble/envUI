import type { ThemeContrast, ThemeScale } from './Theme.js';

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
   * writes nothing and leaves the choice to `prefers-contrast: more`.
   */
  contrast?: ThemeContrast;
  /**
   * The application's scale, as ThemePreferenceProvider's `scale`: `compact` is written to the root
   * as `data-env-scale` before the first paint, so a compact app does not load at the comfortable
   * size. `comfortable`, the default, writes nothing.
   */
  scale?: ThemeScale;
}

export const defaultThemeStorageKey = 'env-theme';

/**
 * Inline script for the document head. It themes the root element before the first paint, so a
 * saved or system dark theme does not flash light while the application loads, and a high or
 * standard contrast applies from the start.
 */
export function createThemeBootstrapScript({
  storageKey = defaultThemeStorageKey,
  defaultPreference = 'system',
  contrast = 'system',
  scale = 'comfortable',
}: ThemeBootstrapOptions = {}) {
  const writeContrast =
    contrast === 'high' || contrast === 'standard'
      ? `r.setAttribute("data-env-contrast",${JSON.stringify(contrast)});`
      : '';
  const writeScale = scale === 'compact' ? `r.setAttribute("data-env-scale","compact");` : '';
  return `(function(){var r=document.documentElement,t="light";try{var p=localStorage.getItem(${JSON.stringify(storageKey)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(defaultPreference)};t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);${writeContrast}${writeScale}r.style.colorScheme=t})();`;
}
