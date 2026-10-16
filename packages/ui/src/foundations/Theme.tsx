'use client';

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

/** A color scheme. */
export type ThemeValue = 'light' | 'dark';

/**
 * The contrast of a Theme: the standard colors, the high-contrast ones, or `system`, which takes the
 * high-contrast colors while the system asks for more contrast (`prefers-contrast: more`).
 */
export type ThemeContrast = 'standard' | 'high' | 'system';

/**
 * The app scale of a Theme: comfortable, the sizes of web and touch apps, or compact, about 0.8 of
 * them with type one step smaller, for desktop productivity apps.
 */
export type ThemeScale = 'comfortable' | 'compact';

/**
 * A control's size: its height in the current scale. Every control of one size has the same height
 * in a scale, so a button, a field and a select of the same size line up.
 */
export type ControlSize = 'sm' | 'md' | 'lg';

/**
 * How tightly a data component, such as a Table, Tree or List, packs its rows: only the rows' block
 * padding changes, never their type, icons or corners. md is the default of tables and lists, sm of
 * trees.
 */
export type RowDensity = 'xs' | 'sm' | 'md' | 'lg';

/** The theme of the nearest Theme boundary, as useTheme returns it. */
export interface ThemeContextValue {
  theme: ThemeValue;
  contrast: ThemeContrast;
  scale: ThemeScale;
}

export interface ThemeProps extends ComponentPropsWithRef<'div'> {
  /** The color scheme. */
  theme: ThemeValue;
  /**
   * `high` for the high-contrast colors; `standard` keeps the standard ones even while the system
   * asks for more contrast; `system` follows `prefers-contrast: more`. Defaults to the contrast of
   * the enclosing Theme, and to `system` outside any. It wins over a `data-env-contrast` attribute
   * passed to the Theme; left out, such an attribute of `high` or `standard` sets the contrast, for
   * the boundary, its nested Themes and its popups alike.
   */
  contrast?: ThemeContrast;
  /**
   * The app scale of everything inside: comfortable, or compact for a desktop productivity app.
   * Use one scale per app or window, and another only on a Theme around a whole region, such as a
   * docked inspector. Defaults to the scale of the enclosing Theme, and to comfortable outside any.
   * It wins over a `data-env-scale` attribute passed to the Theme.
   */
  scale?: ThemeScale;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  contrast: 'system',
  scale: 'comfortable',
});

/** Invalid themes already warned about, so each is reported once. */
const warnedThemes = new Set<string>();

/**
 * In development, reports a theme that is neither light nor dark. In JavaScript, 0.x's
 * `<Theme theme={useTheme()}>` now passes `{ theme, contrast }`, which would theme nothing.
 */
function warnAboutTheme(theme: unknown) {
  if (theme === 'light' || theme === 'dark') return;
  const shown = typeof theme === 'object' && theme !== null ? JSON.stringify(theme) : String(theme);
  if (warnedThemes.has(shown)) return;
  warnedThemes.add(shown);
  // A development-only report, as React reports an invalid prop.
  // eslint-disable-next-line no-console
  console.error(
    `envUI: Theme takes a theme of "light" or "dark", not ${shown}.` +
      (typeof theme === 'object' && theme !== null
        ? ' useTheme() returns { theme, contrast }: write <Theme {...useTheme()}>.'
        : ''),
  );
}

/**
 * An explicit, scoped theme: a color scheme, a contrast and a scale, which nested Themes and envUI's
 * popups keep. Theme preference and persistence belong to the app.
 */
export function Theme({
  theme,
  contrast: ownContrast,
  scale: ownScale,
  className,
  children,
  ...props
}: ThemeProps) {
  // Written inline so bundlers replace process.env.NODE_ENV and drop the warning from production
  // builds; where nothing defines `process`, as in a browser without a bundler, it stays silent.
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
    warnAboutTheme(theme);
  const inherited = useContext(ThemeContext);
  // The prop wins; without it, a data-env-contrast or data-env-scale written on the Theme counts,
  // so that the context its nested Themes and popups read agrees with the attribute.
  const attributes = props as Record<string, unknown>;
  const contrastAttribute = attributes['data-env-contrast'];
  const contrast =
    ownContrast ??
    (contrastAttribute === 'high' || contrastAttribute === 'standard'
      ? contrastAttribute
      : inherited.contrast);
  const scaleAttribute = attributes['data-env-scale'];
  const scale =
    ownScale ??
    (scaleAttribute === 'comfortable' || scaleAttribute === 'compact'
      ? scaleAttribute
      : inherited.scale);
  const value = useMemo(() => ({ theme, contrast, scale }), [theme, contrast, scale]);
  return (
    <ThemeContext value={value}>
      <div
        {...props}
        className={classNames('env-theme', className)}
        data-env-theme={theme}
        data-env-contrast={contrast === 'system' ? undefined : contrast}
        data-env-scale={scale}
      >
        {children}
      </div>
    </ThemeContext>
  );
}

/**
 * The theme of the nearest Theme, including across React portals: its color scheme, contrast and
 * scale. A portal of the application's own takes it with `<Theme {...useTheme()}>`. A contrast of
 * `system` leaves the choice to the stylesheet, which reads `prefers-contrast: more`.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
