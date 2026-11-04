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
   * writes nothing and leaves the choice to `prefers-contrast: more`. The script marks what it
   * writes with `data-env-contrast-source`, `envui:high` or `envui:standard`, as
   * ThemePreferenceProvider marks its own, so the provider treats it as its own: once the
   * application starts, the provider's contrast replaces it, and a provider at `system` removes it
   * while the page has left it unchanged.
   */
  contrast?: ThemeContrast;
  /**
   * The application's scale, as ThemePreferenceProvider's `scale`: `compact` or `comfortable` is
   * written to the root as `data-env-scale` before the first paint, so the app does not load at
   * another size. `system`, the default, writes nothing: the stylesheet takes compact under a fine
   * pointer and comfortable on touch. The script marks what it writes with `data-env-scale-source`,
   * `envui:compact` or `envui:comfortable`, as it marks the contrast, so a ThemePreferenceProvider
   * replaces or removes it as its own while the page has left it unchanged.
   */
  scale?: ThemeScale;
}

export const defaultThemeStorageKey = 'env-theme';

/**
 * Marks a root `data-env-contrast` that envUI wrote, the bootstrap script or a
 * ThemePreferenceProvider, so that any provider, including one mounted later, replaces or removes
 * it as its own rather than leaving it as one the page set. The marker holds the value written,
 * `envui:high`, so a contrast the page wrote over envUI's no longer matches it and stays. The marker
 * lives on the root with the contrast, and goes with it.
 */
export const contrastSourceAttribute = 'data-env-contrast-source';
export const ownContrastSource = (contrast: string) => `envui:${contrast}`;
/**
 * Marks a root `data-env-scale` that envUI wrote, as contrastSourceAttribute marks a contrast: the
 * marker holds the value written, `envui:compact`, so a scale the page wrote over envUI's stays.
 */
export const scaleSourceAttribute = 'data-env-scale-source';
export const ownScaleSource = (scale: string) => `envui:${scale}`;

/**
 * Inline script for the document head. It themes the root element before the first paint, so a
 * saved or system dark theme does not flash light while the application loads, and a high or
 * standard contrast applies from the start.
 */
export function createThemeBootstrapScript({
  storageKey = defaultThemeStorageKey,
  defaultPreference = 'system',
  contrast = 'system',
  scale = 'system',
}: ThemeBootstrapOptions = {}) {
  const writeContrast =
    contrast === 'high' || contrast === 'standard'
      ? `r.setAttribute("data-env-contrast",${JSON.stringify(contrast)});r.setAttribute(${JSON.stringify(contrastSourceAttribute)},${JSON.stringify(ownContrastSource(contrast))});`
      : '';
  const writeScale =
    scale === 'compact' || scale === 'comfortable'
      ? `r.setAttribute("data-env-scale",${JSON.stringify(scale)});r.setAttribute(${JSON.stringify(scaleSourceAttribute)},${JSON.stringify(ownScaleSource(scale))});`
      : '';
  return `(function(){var r=document.documentElement,t="light";try{var p=localStorage.getItem(${JSON.stringify(storageKey)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(defaultPreference)};t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);${writeContrast}${writeScale}r.style.colorScheme=t})();`;
}
