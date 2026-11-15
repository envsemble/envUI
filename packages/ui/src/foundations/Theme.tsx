'use client';

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { outsideTheme } from './internal/outsideTheme.js';
import { themeFromRootAttribute } from './internal/themeFromRoot.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import '../styles/Base.css';

/** A color scheme. */
export type ColorScheme = 'light' | 'dark';

/**
 * The contrast of a Theme: the standard colors, the high-contrast ones, or `system`, which takes the
 * high-contrast colors while the system asks for more contrast (`prefers-contrast: more`).
 */
export type ThemeContrast = 'standard' | 'high' | 'system';

/**
 * The app scale of a Theme: comfortable, the sizes of web and touch apps; compact, about 0.8 of
 * them with type one step smaller, for desktop productivity apps; or `system`, which takes compact
 * where the primary pointer is fine, such as a mouse or trackpad (`pointer: fine`), and comfortable
 * on touch.
 */
export type ThemeScale = 'comfortable' | 'compact' | 'system';

/**
 * How a Theme's rows, tables and cards draw: plain, on the surface they sit on, hovering by a state
 * layer; or filled, as tiles of the filled surface.
 */
export type ThemeSurface = 'plain' | 'filled';

/**
 * The tone of what is selected in a Theme, such as a navigation item, a row or an option: neutral,
 * a gray under the default text color; or accent, the brand's tint under its text color.
 */
export type ThemeSelection = 'neutral' | 'accent';

/**
 * The corner shape of a Theme: sharp, with corners close to square; rounded; or round, with larger
 * corners. Parts that are always circles, such as avatars and radios, stay circles.
 */
export type ThemeCorners = 'sharp' | 'rounded' | 'round';

export type { ControlSize } from '../internal/control/controlTypes.js';

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
  surface: ThemeSurface;
  selection: ThemeSelection;
  corners: ThemeCorners;
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
   * The app scale of everything inside: comfortable, compact, or `system`, which is compact under a
   * fine pointer and comfortable on touch, chosen by the stylesheet. Use one scale per app or
   * window, and another only on a Theme around a whole region, such as a docked inspector. Defaults
   * to the scale of the enclosing Theme, and to `system` outside any. It wins over a
   * `data-env-scale` attribute passed to the Theme.
   */
  scale?: ThemeScale;
  /**
   * How rows, tables and cards draw inside: plain or filled. Defaults to the surface of the
   * enclosing Theme, and to plain outside any.
   */
  surface?: ThemeSurface;
  /**
   * The tone of selected items inside: neutral or accent. Defaults to the selection of the
   * enclosing Theme, and to neutral outside any.
   */
  selection?: ThemeSelection;
  /**
   * The corner shape inside: sharp, rounded or round. Defaults to the corners of the enclosing
   * Theme, and to rounded outside any.
   */
  corners?: ThemeCorners;
}

const ThemeContext = createContext<ThemeContextValue>(outsideTheme);

const unshowableObject = 'an object';

function describeThemeForWarning(theme: unknown): string {
  if (typeof theme !== 'object' || theme === null) return String(theme);
  try {
    const objectsContainingValue: unknown[] = [];
    const shown = JSON.stringify(theme, function (this: unknown, _key, value: unknown) {
      if (typeof value === 'bigint') return `${value}n`;
      if (typeof value !== 'object' || value === null) return value;
      while (
        objectsContainingValue.length > 0 &&
        objectsContainingValue[objectsContainingValue.length - 1] !== this
      )
        objectsContainingValue.pop();
      if (objectsContainingValue.includes(value)) return '[Circular]';
      objectsContainingValue.push(value);
      return value;
    }) as string | undefined;
    return shown ?? unshowableObject;
  } catch {
    return unshowableObject;
  }
}

function themeReport(theme: unknown): string | undefined {
  if (theme === 'light' || theme === 'dark') return undefined;
  return (
    `Theme takes a theme of "light" or "dark", not ${describeThemeForWarning(theme)}.` +
    (typeof theme === 'object' && theme !== null
      ? ' useTheme() returns { theme, contrast }: write <Theme {...useTheme()}>.'
      : '')
  );
}

/**
 * An explicit, scoped theme: a color scheme, a contrast, a scale, and the surface, selection and
 * corners of the look, which nested Themes and envUI's popups keep. Theme preference and
 * persistence belong to the app.
 */
export function Theme({
  theme,
  contrast: ownContrast,
  scale: ownScale,
  surface: ownSurface,
  selection: ownSelection,
  corners: ownCorners,
  className,
  children,
  ...props
}: ThemeProps) {
  reportInDevelopment(() => process.env.NODE_ENV !== 'production' && themeReport(theme));
  const inherited = useContext(ThemeContext);
  const writtenAttributes = props as Record<string, unknown>;
  const contrastAttribute = writtenAttributes['data-env-contrast'];
  const contrast =
    ownContrast ??
    (contrastAttribute === 'high' || contrastAttribute === 'standard'
      ? contrastAttribute
      : inherited.contrast);
  const scaleAttribute = writtenAttributes['data-env-scale'];
  const scale =
    ownScale ??
    (scaleAttribute === 'comfortable' || scaleAttribute === 'compact' || scaleAttribute === 'system'
      ? scaleAttribute
      : inherited.scale);
  const surface = ownSurface ?? inherited.surface;
  const selection = ownSelection ?? inherited.selection;
  const corners = ownCorners ?? inherited.corners;
  const value = useMemo(
    () => ({ theme, contrast, scale, surface, selection, corners }),
    [theme, contrast, scale, surface, selection, corners],
  );
  const boundaryTakesRootLook = themeFromRootAttribute in props;
  return (
    <ThemeContext value={value}>
      <div
        {...props}
        className={className}
        {...(!boundaryTakesRootLook && {
          className: classNames('env-theme', className),
          'data-env-theme': theme,
          'data-env-contrast': contrast === 'system' ? undefined : contrast,
          'data-env-scale': scale,
          'data-env-surface': surface,
          'data-env-selection': selection,
          'data-env-corners': corners,
        })}
      >
        {children}
      </div>
    </ThemeContext>
  );
}

/**
 * The theme of the nearest Theme, including across React portals: its color scheme, contrast,
 * scale, surface, selection and corners. A portal of the application's own takes it with `<Theme {...useTheme()}>`. A contrast of
 * `system` leaves the choice to the stylesheet, which reads `prefers-contrast: more`, as a scale of
 * `system` leaves it to `pointer: fine`.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
