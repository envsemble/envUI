'use client';

import {
  useCallback,
  useContext,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { outsideTheme } from './internal/outsideTheme.js';
import { themeFromRootAttribute } from './internal/themeFromRoot.js';
import { Theme, useTheme, type ThemeContrast, type ThemeScale, type ColorScheme } from './Theme.js';
import {
  contrastSourceAttribute,
  defaultThemeStorageKey,
  lookAttributes,
  ownContrastSource,
  ownScaleSource,
  scaleSourceAttribute,
  type ThemeDefinition,
  type ThemePreference,
} from './themeBootstrap.js';
import {
  ThemePreferenceContext,
  type ThemePreferenceValue,
} from './internal/ThemePreferenceContext.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import { useHydrated } from '../internal/react/useHydrated.js';

export type { ThemePreferenceValue } from './internal/ThemePreferenceContext.js';

const systemDarkQuery = '(prefers-color-scheme: dark)';

export interface ThemePreferenceProviderProps {
  /** The application, or the part of it that the preference themes. */
  children: ReactNode;
  /**
   * The application's theme, from defineTheme: its storage key, default preference, contrast,
   * scale, selection and corners. Give createThemeBootstrapScript the same theme, so the
   * root has it before the first paint. Left out, the stored preference is under `env-theme`, the
   * contrast and scale are an enclosing Theme's, or else the page's on the root, or else system,
   * and the look is an enclosing Theme's, or else neutral and rounded.
   */
  theme?: ThemeDefinition;
  /**
   * Theme the document root as well as this subtree (default). Root theming covers the page
   * background, native controls, portals rendered by other libraries and the content of every
   * theme-color meta tag, which takes the canvas color. One provider per document applies to it:
   * pass false to any other, nested in it or beside it. In development, envUI reports two providers
   * that both apply. Outside any Theme, its boundary around the children is a plain element that
   * takes the root's look, with none of a Theme's class and attributes, unless its contrast is
   * system while the page set a contrast of its own on the root. Rendered on the server, and
   * as the page hydrates, it renders the preference's default and leaves the page's look to the
   * theme createThemeBootstrapScript gave the root, which knows the stored preference before the
   * first paint; once hydrated, it takes the stored one.
   */
  applyToDocument?: boolean;
  /** Class name for the Theme boundary around the children. */
  className?: string;
}

function readStorageUnlessBlocked(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageUnlessBlocked(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function readStoredPreference(storageKey: string, fallback: ThemePreference): ThemePreference {
  const stored = readStorageUnlessBlocked(storageKey);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : fallback;
}

interface DocumentWrites {
  contrast?: Exclude<ThemeContrast, 'system'>;
  scale?: ThemeScale;
  look?: Record<string, string>;
}

const documentProviders = new Map<symbol, DocumentWrites>();

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

function releaseLook(root: HTMLElement, look: Record<string, string> | undefined) {
  for (const [attribute, value] of Object.entries(look ?? {}))
    if (root.getAttribute(attribute) === value) root.removeAttribute(attribute);
}

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

function readPageScale(): ThemeScale | undefined {
  const root = document.documentElement;
  const scale = root.dataset.envScale;
  if (scale !== 'comfortable' && scale !== 'compact' && scale !== 'system') return undefined;
  return root.getAttribute(scaleSourceAttribute) === ownScaleSource(scale) ? undefined : scale;
}

function readPageContrast(): Exclude<ThemeContrast, 'system'> | undefined {
  const root = document.documentElement;
  const contrast = root.dataset.envContrast;
  if (contrast !== 'high' && contrast !== 'standard') return undefined;
  return root.getAttribute(contrastSourceAttribute) === ownContrastSource(contrast)
    ? undefined
    : contrast;
}

const onServer = () => undefined;

const serverSystemTheme: ColorScheme = 'light';

const restyleNow = (element: Element) => void getComputedStyle(element).transitionProperty;

const switchingAttribute = 'data-env-theme-switching';

function readSystemTheme(): ColorScheme {
  return typeof window !== 'undefined' && window.matchMedia?.(systemDarkQuery).matches
    ? 'dark'
    : 'light';
}

function useStoredPreference(storageKey: string, defaultPreference: ThemePreference) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window === 'undefined'
      ? defaultPreference
      : readStoredPreference(storageKey, defaultPreference),
  );
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
  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      writeStorageUnlessBlocked(storageKey, next);
    },
    [storageKey],
  );
  return [preference, setPreference] as const;
}

function useInstantColorSwitch(applyToDocument: boolean, colors: string | undefined) {
  const shownColors = useRef<string | undefined>(undefined);
  useInsertionEffect(() => {
    const colorsAlreadyShown = shownColors.current !== undefined;
    if (
      applyToDocument &&
      colors !== undefined &&
      colorsAlreadyShown &&
      shownColors.current !== colors
    )
      document.documentElement.setAttribute(switchingAttribute, '');
  }, [applyToDocument, colors]);
  useLayoutEffect(() => {
    shownColors.current = colors;
    const root = document.documentElement;
    if (!root.hasAttribute(switchingAttribute)) return;
    restyleNow(root);
    let timer = 0;
    const resumeTransitionsAfterTheFrameThatShowsThem = requestAnimationFrame(() => {
      timer = window.setTimeout(() => root.removeAttribute(switchingAttribute));
    });
    return () => {
      cancelAnimationFrame(resumeTransitionsAfterTheFrameThatShowsThem);
      clearTimeout(timer);
    };
  }, [colors]);
}

/** Owns the theme preference: persistence, the system theme and document-root theming. */
export function ThemePreferenceProvider({
  children,
  theme: definition = {},
  applyToDocument = true,
  className,
}: ThemePreferenceProviderProps) {
  const {
    storageKey = defaultThemeStorageKey,
    defaultPreference = 'system',
    contrast: ownContrast,
    scale: ownScale,
  } = definition;
  const inherited = useTheme();
  const selection = definition.selection ?? inherited.selection;
  const corners = definition.corners ?? inherited.corners;
  const takesPageScaleAndContrast = applyToDocument && inherited === outsideTheme;
  const pageScale = useSyncExternalStore(subscribeToRoot, readPageScale, onServer);
  const pageContrast = useSyncExternalStore(subscribeToRoot, readPageContrast, onServer);
  const appliedContrast = ownContrast ?? inherited.contrast;
  const contrast =
    ownContrast ?? (takesPageScaleAndContrast ? (pageContrast ?? 'system') : inherited.contrast);
  const scale = ownScale ?? (takesPageScaleAndContrast ? (pageScale ?? 'system') : inherited.scale);
  const leavesPageContrastOnRoot = ownContrast === 'system' && pageContrast !== undefined;
  const boundaryTakesRootLook = takesPageScaleAndContrast && !leavesPageContrastOnRoot;
  const [storedPreference, setPreference] = useStoredPreference(storageKey, defaultPreference);
  const [systemTheme, setSystemTheme] = useState<ColorScheme>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.envTheme === 'dark'
      ? 'dark'
      : readSystemTheme(),
  );
  const hydrated = useHydrated();
  const preference = hydrated ? storedPreference : defaultPreference;
  const theme: ColorScheme =
    preference === 'system' ? (hydrated ? systemTheme : serverSystemTheme) : preference;
  const [provider] = useState(() => Symbol('ThemePreferenceProvider'));

  useEffect(() => {
    if (storedPreference !== 'system' || !window.matchMedia) return;
    const query = window.matchMedia(systemDarkQuery);
    const update = () => setSystemTheme(query.matches ? 'dark' : 'light');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [storedPreference]);

  useInsertionEffect(
    function registerBeforeWritingRoot() {
      if (!applyToDocument) return;
      reportInDevelopment(
        () =>
          process.env.NODE_ENV !== 'production' &&
          documentProviders.size > 0 &&
          'more than one ThemePreferenceProvider applies to the document. Let one theme the root and pass applyToDocument={false} to the others.',
      );
      documentProviders.set(provider, {});
      return function releaseWhatItWrote() {
        const { look } = documentProviders.get(provider) ?? {};
        documentProviders.delete(provider);
        const root = document.documentElement;
        root.removeAttribute(switchingAttribute);
        releaseContrast(root);
        releaseScale(root);
        releaseLook(root, look);
      };
    },
    [applyToDocument, provider],
  );

  useInstantColorSwitch(
    applyToDocument,
    hydrated ? `${theme} ${contrast} ${appliedContrast} ${selection}` : undefined,
  );

  useInsertionEffect(
    function themeRootBeforeLayoutEffects() {
      if (!applyToDocument || !hydrated) return;
      const root = document.documentElement;
      root.classList.add('env-theme');
      root.dataset.envTheme = theme;
      const contrastToWrite = appliedContrast === 'system' ? undefined : appliedContrast;
      documentProviders.set(provider, {
        ...documentProviders.get(provider),
        contrast: contrastToWrite,
      });
      if (contrastToWrite) {
        root.dataset.envContrast = contrastToWrite;
        root.setAttribute(contrastSourceAttribute, ownContrastSource(contrastToWrite));
      } else releaseContrast(root);
      documentProviders.set(provider, { ...documentProviders.get(provider), scale: ownScale });
      if (ownScale) {
        root.dataset.envScale = ownScale;
        root.setAttribute(scaleSourceAttribute, ownScaleSource(ownScale));
      } else releaseScale(root);
      const look = {
        [lookAttributes.selection]: selection,
        [lookAttributes.corners]: corners,
      };
      for (const [attribute, value] of Object.entries(look)) root.setAttribute(attribute, value);
      documentProviders.set(provider, { ...documentProviders.get(provider), look });
      root.style.colorScheme = theme;
    },
    [applyToDocument, hydrated, theme, appliedContrast, ownScale, selection, corners, provider],
  );

  useLayoutEffect(
    function matchBrowserInterfaceToCanvasBeforePaint() {
      if (!applyToDocument || !hydrated) return;
      const browserThemes = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
      if (!browserThemes.length) return;
      const canvas = getComputedStyle(document.documentElement).backgroundColor;
      for (const browserTheme of browserThemes) browserTheme.content = canvas;
    },
    [applyToDocument, hydrated, theme, appliedContrast, ownScale, selection],
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
      <Theme
        theme={theme}
        contrast={contrast}
        scale={scale}
        selection={selection}
        corners={corners}
        className={className}
        {...(boundaryTakesRootLook && { [themeFromRootAttribute]: '' })}
      >
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
