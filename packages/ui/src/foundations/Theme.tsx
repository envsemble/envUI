'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ComponentPropsWithRef,
  type ReactElement,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { renderElement } from '../internal/react/renderElement.js';
import { outsideTheme } from './internal/outsideTheme.js';
import { themeFromRootAttribute } from './internal/themeFromRoot.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import { explicitContrasts, isOneOf, themeScales } from '../internal/theme/themeRoot.js';
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
   * The tone of selected items inside: neutral or accent. Defaults to the selection of the
   * enclosing Theme, and to neutral outside any.
   */
  selection?: ThemeSelection;
  /**
   * The corner shape inside: sharp, rounded or round. Defaults to the corners of the enclosing
   * Theme, and to rounded outside any.
   */
  corners?: ThemeCorners;
  /**
   * The boundary's element, for its meaning or its place in the markup, such as
   * render={<section />} for a landmark or render={<tbody />} inside a table. The boundary's class
   * and attributes merge into its props, as on Text: classes join, styles merge, both event
   * handlers run and both refs receive the node. A div by default.
   */
  render?: ReactElement;
}

const ThemeContext = createContext<ThemeContextValue>(outsideTheme);

const unshowableObject = 'an object';

function describeThemeInReport(theme: unknown): string {
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
    `Theme takes a theme of "light" or "dark", not ${describeThemeInReport(theme)}.` +
    (typeof theme === 'object' && theme !== null
      ? ' useTheme() returns { theme, contrast }: write <Theme {...useTheme()}>.'
      : '')
  );
}

/**
 * An explicit, scoped theme: a color scheme, a contrast, a scale, and the selection and corners
 * of the look, which nested Themes and envUI's popups keep. Theme preference and
 * persistence belong to the app.
 */
export function Theme({
  theme,
  contrast: ownContrast,
  scale: ownScale,
  selection: ownSelection,
  corners: ownCorners,
  className,
  render,
  children,
  ...props
}: ThemeProps) {
  reportInDevelopment(() => process.env.NODE_ENV !== 'production' && themeReport(theme));
  const inherited = useContext(ThemeContext);
  const writtenAttributes = props as Record<string, unknown>;
  const contrastAttribute = writtenAttributes['data-env-contrast'];
  const contrast =
    ownContrast ??
    (isOneOf(explicitContrasts, contrastAttribute) ? contrastAttribute : inherited.contrast);
  const scaleAttribute = writtenAttributes['data-env-scale'];
  const scale =
    ownScale ?? (isOneOf(themeScales, scaleAttribute) ? scaleAttribute : inherited.scale);
  const selection = ownSelection ?? inherited.selection;
  const corners = ownCorners ?? inherited.corners;
  const value = useMemo(
    () => ({ theme, contrast, scale, selection, corners }),
    [theme, contrast, scale, selection, corners],
  );
  const boundaryTakesRootLook = themeFromRootAttribute in props;
  const boundary = {
    ...props,
    className,
    ...(!boundaryTakesRootLook && {
      className: classNames('env-theme', className),
      'data-env-theme': theme,
      'data-env-contrast': contrast === 'system' ? undefined : contrast,
      'data-env-scale': scale,
      'data-env-selection': selection,
      'data-env-corners': corners,
    }),
    children,
  };
  return <ThemeContext value={value}>{renderElement('div', render, boundary)}</ThemeContext>;
}

/**
 * The theme of the nearest Theme, including across React portals: its color scheme, contrast,
 * scale, selection and corners. A portal of the application's own takes it with `<Theme {...useTheme()}>`. A contrast of
 * `system` leaves the choice to the stylesheet, which reads `prefers-contrast: more`, as a scale of
 * `system` leaves it to `pointer: fine`.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
