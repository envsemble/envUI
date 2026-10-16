'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { outsideTheme } from '../internal/outsideTheme.js';
import { Theme, useTheme, type ThemeContrast, type ThemeScale, type ThemeValue } from './Theme.js';
import { IconButton, type IconButtonProps } from '../actions/Button.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { themeToggle } from './messages/themeToggle.js';
import { DarkMode } from '../icons/DarkMode.js';
import { LightMode } from '../icons/LightMode.js';
import {
  contrastSourceAttribute,
  defaultThemeStorageKey,
  ownContrastSource,
  ownScaleSource,
  scaleSourceAttribute,
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
   * theme-color meta tag, which takes the canvas color. One provider per document applies to it:
   * pass false to any other, nested in it or beside it. In development, envUI reports two providers
   * that both apply.
   */
  applyToDocument?: boolean;
  /**
   * Contrast of the Theme boundary around the children, and of the document root with
   * applyToDocument: high, standard, or system to follow `prefers-contrast: more`, as on Theme.
   * Defaults to the contrast of an enclosing Theme; outside any, a provider applying to the
   * document gives its boundary a contrast the page set on the root, and otherwise system. With
   * system, the provider removes from the root only a contrast that envUI wrote and the page left
   * unchanged: a provider, this one or one before it, or the bootstrap script. Pass a contrast that
   * is fixed for the application to createThemeBootstrapScript too, so the root has it before the
   * first paint.
   */
  contrast?: ThemeContrast;
  /**
   * The app scale, comfortable or compact for a desktop productivity app, as on Theme: of the Theme
   * boundary around the children, and, marked as envUI's own, of the document root with
   * applyToDocument. Without it, the boundary takes the scale of an enclosing Theme; outside any, a
   * provider applying to the document gives its boundary a scale the page set on the root, so the
   * application, the page and its portals share it, and otherwise comfortable. The root keeps a
   * scale the page set but drops one that envUI wrote and the page left unchanged. Pass the same
   * scale to createThemeBootstrapScript so the root has it before the first paint.
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

/** What a provider applying to the document has written on the root. */
interface DocumentWrites {
  contrast?: Exclude<ThemeContrast, 'system'>;
  scale?: ThemeScale;
}

/**
 * The providers applying to the document now, with what each wrote there. Only one should; with
 * more, a provider at system still leaves a contrast another of them wrote.
 */
const documentProviders = new Map<symbol, DocumentWrites>();
let warnedAboutProviders = false;

/**
 * Removes the root's contrast when envUI wrote it, the page has not written over it since, and no
 * mounted provider holds it. A marker the page's own contrast no longer matches goes on its own.
 */
function releaseContrast(root: HTMLElement) {
  const marker = root.getAttribute(contrastSourceAttribute);
  if (marker === null) return;
  const contrast = root.dataset.envContrast;
  if (contrast === undefined || marker !== ownContrastSource(contrast)) {
    root.removeAttribute(contrastSourceAttribute);
    return;
  }
  for (const writes of documentProviders.values()) if (writes.contrast === contrast) return;
  delete root.dataset.envContrast;
  root.removeAttribute(contrastSourceAttribute);
}

/**
 * Removes the root's scale when envUI wrote it, the page has not written over it since, and no
 * mounted provider holds it, as releaseContrast does for the contrast.
 */
function releaseScale(root: HTMLElement) {
  const marker = root.getAttribute(scaleSourceAttribute);
  if (marker === null) return;
  const scale = root.dataset.envScale;
  if (scale === undefined || marker !== ownScaleSource(scale)) {
    root.removeAttribute(scaleSourceAttribute);
    return;
  }
  for (const writes of documentProviders.values()) if (writes.scale === scale) return;
  delete root.dataset.envScale;
  root.removeAttribute(scaleSourceAttribute);
}

/** Calls back whenever the root's scale or contrast, or envUI's markers of them, change. */
function subscribeToRoot(change: () => void) {
  const observer = new MutationObserver(change);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      'data-env-scale',
      'data-env-contrast',
      scaleSourceAttribute,
      contrastSourceAttribute,
    ],
  });
  return () => observer.disconnect();
}

/** The root's scale when the page set it rather than envUI. */
function readPageScale(): ThemeScale | undefined {
  const root = document.documentElement;
  const scale = root.dataset.envScale;
  if (scale !== 'comfortable' && scale !== 'compact') return undefined;
  return root.getAttribute(scaleSourceAttribute) === ownScaleSource(scale) ? undefined : scale;
}

/** The root's contrast when the page set it rather than envUI. */
function readPageContrast(): Exclude<ThemeContrast, 'system'> | undefined {
  const root = document.documentElement;
  const contrast = root.dataset.envContrast;
  if (contrast !== 'high' && contrast !== 'standard') return undefined;
  return root.getAttribute(contrastSourceAttribute) === ownContrastSource(contrast)
    ? undefined
    : contrast;
}

const onServer = () => undefined;

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
  // Outside any Theme, a provider that applies to the document gives its boundary the scale and
  // contrast the page set on the root, which the page and other libraries' portals already show,
  // rather than comfortable and system. It never writes them back as its own.
  const fromPage = applyToDocument && inherited === outsideTheme;
  const pageScale = useSyncExternalStore(subscribeToRoot, readPageScale, onServer);
  const pageContrast = useSyncExternalStore(subscribeToRoot, readPageContrast, onServer);
  const appliedContrast = ownContrast ?? inherited.contrast;
  const contrast = ownContrast ?? (fromPage ? (pageContrast ?? 'system') : inherited.contrast);
  const scale = ownScale ?? (fromPage ? (pageScale ?? 'comfortable') : inherited.scale);
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
  const [provider] = useState(() => Symbol('ThemePreferenceProvider'));

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

  // One provider applies to the document; a second would write over the first's root theme.
  useEffect(() => {
    if (!applyToDocument) return;
    try {
      if (
        process.env.NODE_ENV !== 'production' &&
        documentProviders.size > 0 &&
        !warnedAboutProviders
      ) {
        warnedAboutProviders = true;
        // A development-only report, as React reports an invalid prop.
        // eslint-disable-next-line no-console
        console.error(
          'envUI: more than one ThemePreferenceProvider applies to the document. Let one theme the root and pass applyToDocument={false} to the others.',
        );
      }
    } catch {
      // No bundler defined process.env.NODE_ENV: written as in Theme.
    }
    documentProviders.set(provider, {});
    // Once the provider unmounts or stops applying to the document, it releases what it wrote on
    // the root, as a provider at system does: what the page wrote or another provider holds stays.
    return () => {
      documentProviders.delete(provider);
      const root = document.documentElement;
      releaseContrast(root);
      releaseScale(root);
    };
  }, [applyToDocument, provider]);

  useEffect(() => {
    if (!applyToDocument) return;
    const root = document.documentElement;
    root.classList.add('env-theme');
    root.dataset.envTheme = theme;
    // Like a Theme boundary, the root leaves system contrast to prefers-contrast: more. What envUI
    // writes carries a marker with the value, so a provider removes a contrast that it, a provider
    // before it (such as one keyed by the user) or the bootstrap script wrote, and one the page set
    // itself, or wrote over envUI's, stays.
    const written = appliedContrast === 'system' ? undefined : appliedContrast;
    documentProviders.set(provider, { ...documentProviders.get(provider), contrast: written });
    if (written) {
      root.dataset.envContrast = written;
      root.setAttribute(contrastSourceAttribute, ownContrastSource(written));
    } else releaseContrast(root);
    // The root takes a scale the provider is given, marked with its value as the contrast is;
    // without one it keeps a scale the page set and drops one envUI wrote.
    documentProviders.set(provider, { ...documentProviders.get(provider), scale: ownScale });
    if (ownScale) {
      root.dataset.envScale = ownScale;
      root.setAttribute(scaleSourceAttribute, ownScaleSource(ownScale));
    } else releaseScale(root);
    root.style.colorScheme = theme;
    // The browser's own interface, such as a mobile address bar, takes the canvas color. Every
    // theme-color tag follows, including ones written for a system color scheme with media.
    const canvas = getComputedStyle(root).backgroundColor;
    for (const browserTheme of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    ))
      browserTheme.content = canvas;
  }, [applyToDocument, theme, appliedContrast, ownScale, provider]);

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

export type ThemeToggleProps = (IconButtonProps extends infer Props
  ? Props extends unknown
    ? Omit<Props, 'icon' | 'aria-label' | 'onClick'>
    : never
  : never) & {
  /**
   * The button's name; without it, Switch to dark theme or Switch to light theme, or
   * EnvUIProvider's messages.themeToggle.
   */
  'aria-label'?: string;
};

/** Switches between the light and dark themes and stores the choice. */
export function ThemeToggle({
  title,
  className,
  'aria-label': ownLabel,
  ...props
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemePreference();
  const messages = useMessages('themeToggle', themeToggle);
  const label = ownLabel ?? (theme === 'light' ? messages.toDark : messages.toLight);
  return (
    <IconButton
      {...(props as IconButtonProps)}
      className={classNames('env-theme-toggle', className)}
      icon={theme === 'light' ? <DarkMode /> : <LightMode />}
      aria-label={label}
      title={title ?? label}
      onClick={toggleTheme}
    />
  );
}
