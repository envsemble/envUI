'use client';

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { outsideTheme } from './internal/outsideTheme.js';
import { reportOnce } from '../internal/developmentReport.js';
import '../styles/Base.css';

/** A color scheme. */
export type ColorScheme = 'light' | 'dark';

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

export type { ControlSize } from '../internal/controlTypes.js';

/**
 * How tightly a data component, such as a Table, Tree or List, packs its rows: only the rows' block
 * padding changes, never their type, icons or corners. md is the default of tables and lists, sm of
 * trees.
 */
export type RowDensity = 'xs' | 'sm' | 'md' | 'lg';

/** The theme of the nearest Theme boundary, as useTheme returns it. */
export interface ThemeContextValue {
  theme: ColorScheme;
  contrast: ThemeContrast;
  scale: ThemeScale;
}

export interface ThemeProps extends ComponentPropsWithRef<'div'> {
  /** The color scheme. */
  theme: ColorScheme;
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

const ThemeContext = createContext<ThemeContextValue>(outsideTheme);

/** A theme as a warning shows it; JSON for an object, without throwing on any value. */
function showTheme(theme: unknown): string {
  if (typeof theme !== 'object' || theme === null) return String(theme);
  try {
    // The objects that contain the one being shown: only a value among them is circular, so an
    // object that merely appears twice is shown both times.
    const ancestors: unknown[] = [];
    const shown = JSON.stringify(theme, function (this: unknown, _key, value: unknown) {
      if (typeof value === 'bigint') return `${value}n`;
      if (typeof value !== 'object' || value === null) return value;
      // `this` holds `value`; the objects shown since, which don't contain it, are left.
      while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();
      if (ancestors.includes(value)) return '[Circular]';
      ancestors.push(value);
      return value;
    }) as string | undefined;
    // A toJSON that returns undefined, or a function, leaves nothing to show.
    return shown ?? 'an object';
  } catch {
    // A getter, toJSON or proxy that throws.
    return 'an object';
  }
}

/**
 * In development, the report about a theme that is neither light nor dark. In JavaScript, 0.x's
 * `<Theme theme={useTheme()}>` now passes `{ theme, contrast }`, which would theme nothing.
 */
function themeReport(theme: unknown): { shown: string; message: string } | undefined {
  if (theme === 'light' || theme === 'dark') return undefined;
  const shown = showTheme(theme);
  return {
    shown,
    message:
      `Theme takes a theme of "light" or "dark", not ${shown}.` +
      (typeof theme === 'object' && theme !== null
        ? ' useTheme() returns { theme, contrast }: write <Theme {...useTheme()}>.'
        : ''),
  };
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
  // Written inline so bundlers replace process.env.NODE_ENV, which leaves the check standing in a
  // development build and drops the warning from a production one. `process` itself stays
  // undefined in a browser, so the check must not test it: where nothing replaced the expression,
  // as without a bundler, reading it throws and the warning stays silent. The report is built in
  // there, by code that doesn't throw; console.error, which a test may make throw, runs outside, and
  // the theme counts as reported once it has run, once for each theme shown.
  let report: ReturnType<typeof themeReport>;
  try {
    if (process.env.NODE_ENV !== 'production') report = themeReport(theme);
  } catch {
    // No bundler defined process.env.NODE_ENV.
  }
  if (report) reportOnce(report.message, { key: `Theme ${report.shown}` });
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
