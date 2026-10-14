/** Preference stored by ThemePreferenceProvider: an explicit theme or the operating system's. */
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeBootstrapOptions {
  /** localStorage key shared with ThemePreferenceProvider. Defaults to "env-theme". */
  storageKey?: string;
  /** Used when nothing is stored. Defaults to "system". */
  defaultPreference?: ThemePreference;
}

export const defaultThemeStorageKey = 'env-theme';

/**
 * Inline script for the document head. It themes the root element before the first paint, so a
 * saved or system dark theme does not flash light while the application loads.
 */
export function createThemeBootstrapScript({
  storageKey = defaultThemeStorageKey,
  defaultPreference = 'system',
}: ThemeBootstrapOptions = {}) {
  return `(function(){var r=document.documentElement,t="light";try{var p=localStorage.getItem(${JSON.stringify(storageKey)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(defaultPreference)};t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);r.style.colorScheme=t})();`;
}
