import { createContext, useContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Theme, useTheme, type ThemeContextValue, type ThemeValue } from '@envsemble/envui';

/**
 * What a figure shows: `example`, envUI itself at work, which takes the theme opposite the
 * catalogue's, so it never reads as part of the page around it; `explanation`, a figure that
 * explains the system, such as a token scale, which stays in the catalogue's theme. Outside any
 * figure it is `none`.
 */
export type FigureKind = 'example' | 'explanation' | 'none';

const FigureScope = createContext<FigureKind>('none');

const opposite: Record<ThemeValue, ThemeValue> = { light: 'dark', dark: 'light' };

/** The kind of the figure around, or `none` outside any. */
export function useFigureKind(): FigureKind {
  return useContext(FigureScope);
}

/**
 * The theme an example takes: the scheme opposite the catalogue's, with the catalogue's contrast
 * and scale. Inside an example already, the example's own theme, so an example never flips twice.
 */
export function useExampleTheme(): ThemeContextValue {
  const theme = useTheme();
  const kind = useContext(FigureScope);
  return kind === 'example' ? theme : { ...theme, theme: opposite[theme.theme] };
}

/**
 * The theme boundary of an example: a real envUI Theme in the scheme opposite the catalogue's,
 * which its popups, dialogs, tooltips and toasts keep through their portals, painted in that
 * theme's page color.
 */
export function ExampleTheme(props: Omit<ComponentPropsWithRef<typeof Theme>, 'theme'>) {
  const theme = useExampleTheme();
  return (
    <FigureScope value="example">
      <Theme {...theme} {...props} />
    </FigureScope>
  );
}

/** A figure that explains the system: it keeps the catalogue's theme, and so does what it holds. */
export function ExplanationScope({ children }: { children: ReactNode }) {
  return <FigureScope value="explanation">{children}</FigureScope>;
}
