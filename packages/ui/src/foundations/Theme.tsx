import { createContext, useContext, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export type ThemeValue = 'light' | 'dark';

export interface ThemeProps extends ComponentPropsWithRef<'div'> {
  theme: ThemeValue;
}

const ThemeContext = createContext<ThemeValue>('light');

/** An explicit, scoped theme. Theme preference and persistence belong to the app. */
export function Theme({ theme, className, children, ...props }: ThemeProps) {
  return (
    <ThemeContext value={theme}>
      <div {...props} className={classNames('env-theme', className)} data-env-theme={theme}>
        {children}
      </div>
    </ThemeContext>
  );
}

/** Returns the originating theme, including across React portals. */
export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
