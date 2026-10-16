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
   * the enclosing Theme, and to `system` outside any.
   */
  contrast?: ThemeContrast;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', contrast: 'system' });

/**
 * An explicit, scoped theme: a color scheme and a contrast, which nested Themes and envUI's popups
 * keep. Theme preference and persistence belong to the app.
 */
export function Theme({ theme, contrast: ownContrast, className, children, ...props }: ThemeProps) {
  const inherited = useContext(ThemeContext).contrast;
  const contrast = ownContrast ?? inherited;
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
