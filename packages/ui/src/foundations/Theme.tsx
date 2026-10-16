'use client';

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { isDevelopment } from '../internal/isDevelopment.js';

/** A color scheme. */
export type ThemeValue = 'light' | 'dark';

/**
 * The contrast of a Theme: the standard colors, the high-contrast ones, or `system`, which takes the
 * high-contrast colors while the system asks for more contrast (`prefers-contrast: more`).
 */
export type ThemeContrast = 'standard' | 'high' | 'system';

/** The theme of the nearest Theme boundary, as useTheme returns it. */
export interface ThemeContextValue {
  theme: ThemeValue;
  contrast: ThemeContrast;
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
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', contrast: 'system' });

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
 * An explicit, scoped theme: a color scheme and a contrast, which nested Themes and envUI's popups
 * keep. Theme preference and persistence belong to the app.
 */
export function Theme({ theme, contrast: ownContrast, className, children, ...props }: ThemeProps) {
  if (isDevelopment()) warnAboutTheme(theme);
  const inherited = useContext(ThemeContext).contrast;
  // The prop wins; without it, a data-env-contrast written on the Theme counts, so that the
  // context its nested Themes and popups read agrees with the attribute.
  const attribute = (props as Record<string, unknown>)['data-env-contrast'];
  const contrast =
    ownContrast ?? (attribute === 'high' || attribute === 'standard' ? attribute : inherited);
  const value = useMemo(() => ({ theme, contrast }), [theme, contrast]);
  return (
    <ThemeContext value={value}>
      <div
        {...props}
        className={classNames('env-theme', className)}
        data-env-theme={theme}
        data-env-contrast={contrast === 'system' ? undefined : contrast}
      >
        {children}
      </div>
    </ThemeContext>
  );
}

/**
 * The theme of the nearest Theme, including across React portals. A portal of the application's
 * own takes it with `<Theme {...useTheme()}>`. A contrast of `system` leaves the choice to the
 * stylesheet, which reads `prefers-contrast: more`.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
