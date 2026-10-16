'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Theme, useTheme, type ThemeContrast, type ThemeScale, type ThemeValue } from './Theme.js';
import { IconButton, type IconButtonProps } from '../actions/Button.js';
import { DarkMode } from '../icons/DarkMode.js';
import { LightMode } from '../icons/LightMode.js';
import {
  contrastSourceAttribute,
  defaultThemeStorageKey,
  ownContrastSource,
  type ThemePreference,
} from './ThemeBootstrap.js';

interface ThemePreferenceValue {
  /** The stored choice. */
  preference: ThemePreference;
  /** The theme in use after resolving "system". */
  theme: ThemeValue;
  setPreference: (preference: ThemePreference) => void;
  /** Store the opposite of the current theme. */
  toggleTheme: () => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);
const systemDarkQuery = '(prefers-color-scheme: dark)';

export interface ThemePreferenceProviderProps {
  children: ReactNode;
  /** localStorage key; match the bootstrap script's. Defaults to "env-theme". */
  storageKey?: string;
  /** Used when nothing is stored. Defaults to "system". */
  defaultPreference?: ThemePreference;
  /**
   * Theme the document root as well as this subtree (default). Root theming covers the page
   * background, native controls, portals rendered by other libraries and the content of every
   * theme-color meta tag, which takes the canvas color.
   */
  applyToDocument?: boolean;
  /**
   * Contrast of the Theme boundary around the children, and of the document root with
   * applyToDocument: high, standard, or system to follow `prefers-contrast: more`, as on Theme.
   * Defaults to the contrast of an enclosing Theme, and to system. With system, the provider
   * removes from the root only a contrast that envUI wrote: a provider, this one or one before it,
   * or the bootstrap script. Pass a contrast that is fixed for the application to
   * createThemeBootstrapScript too, so the root has it before the first paint.
   */
  contrast?: ThemeContrast;
  /**
   * The app scale of the Theme boundary around the children, and of the document root with
   * applyToDocument: comfortable, or compact for a desktop productivity app, as on Theme. Defaults
   * to the scale of an enclosing Theme, and to comfortable. Pass the same scale to
   * createThemeBootstrapScript so the root has it before the first paint.
   */
  scale?: ThemeScale;
  /** Class name for the Theme boundary around the children. */
  className?: string;
}

function readStoredPreference(storageKey: string, fallback: ThemePreference): ThemePreference {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Storage can be blocked; the default still applies.
  }
  return fallback;
}

function readSystemTheme(): ThemeValue {
  return typeof window !== 'undefined' && window.matchMedia?.(systemDarkQuery).matches
    ? 'dark'
    : 'light';
}

/** Owns the theme preference: persistence, the system theme and document-root theming. */
export function ThemePreferenceProvider({
  children,
  storageKey = defaultThemeStorageKey,
  defaultPreference = 'system',
  applyToDocument = true,
  contrast: ownContrast,
  scale: ownScale,
  className,
}: ThemePreferenceProviderProps) {
  const inherited = useTheme();
  const contrast = ownContrast ?? inherited.contrast;
  const scale = ownScale ?? inherited.scale;
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window === 'undefined'
      ? defaultPreference
      : readStoredPreference(storageKey, defaultPreference),
  );
  const [systemTheme, setSystemTheme] = useState<ThemeValue>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.envTheme === 'dark'
      ? 'dark'
      : readSystemTheme(),
  );
  const theme: ThemeValue = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return;
    const query = window.matchMedia(systemDarkQuery);
    const update = () => setSystemTheme(query.matches ? 'dark' : 'light');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [preference]);

  // A choice made in another window or tab of the same origin applies here too.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== storageKey) return;
      const next = event.newValue;
      setPreferenceState(
        next === 'light' || next === 'dark' || next === 'system' ? next : defaultPreference,
      );
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, defaultPreference]);

  useEffect(() => {
    if (!applyToDocument) return;
    const root = document.documentElement;
    root.classList.add('env-theme');
    root.dataset.envTheme = theme;
    // Like a Theme boundary, the root leaves system contrast to prefers-contrast: more. What envUI
    // writes carries a marker on the root, so a provider removes a contrast that it, a provider
    // before it (such as one keyed by the user) or the bootstrap script wrote, and one the page
    // set itself stays.
    if (contrast !== 'system') {
      root.dataset.envContrast = contrast;
      root.setAttribute(contrastSourceAttribute, ownContrastSource);
    } else if (root.getAttribute(contrastSourceAttribute) === ownContrastSource) {
      delete root.dataset.envContrast;
      root.removeAttribute(contrastSourceAttribute);
    }
    root.dataset.envScale = scale;
    root.style.colorScheme = theme;
    // The browser's own interface, such as a mobile address bar, takes the canvas color. Every
    // theme-color tag follows, including ones written for a system color scheme with media.
    const canvas = getComputedStyle(root).backgroundColor;
    for (const browserTheme of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    ))
      browserTheme.content = canvas;
  }, [applyToDocument, theme, contrast, scale]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // A blocked storage API should not prevent switching for this visit.
      }
    },
    [storageKey],
  );
  const value = useMemo<ThemePreferenceValue>(
    () => ({
      preference,
      theme,
      setPreference,
      toggleTheme: () => setPreference(theme === 'light' ? 'dark' : 'light'),
    }),
    [preference, theme, setPreference],
  );

  return (
    <ThemePreferenceContext value={value}>
      <Theme theme={theme} contrast={contrast} scale={scale} className={className}>
        {children}
      </Theme>
    </ThemePreferenceContext>
  );
}

/** The theme preference from the nearest ThemePreferenceProvider. */
export function useThemePreference(): ThemePreferenceValue {
  const value = useContext(ThemePreferenceContext);
  if (!value) throw new Error('useThemePreference must be used inside ThemePreferenceProvider.');
  return value;
}

export type ThemeToggleProps = Omit<IconButtonProps, 'icon' | 'aria-label' | 'onClick'>;

/** Switches between the light and dark themes and stores the choice. */
export function ThemeToggle({ title, className, ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemePreference();
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`;
  return (
    <IconButton
      {...props}
      className={classNames('env-theme-toggle', className)}
      icon={theme === 'light' ? <DarkMode /> : <LightMode />}
      aria-label={label}
      title={title ?? label}
      onClick={toggleTheme}
    />
  );
}
