import { Theme, useTheme, type ThemeProps } from '@envsemble/envui';

/**
 * A theme boundary on the page's theme, contrast and scale, which follows them as the reader
 * switches, such as a figure's stage: `<Column render={<PageTheme />}>`. It reads the theme itself,
 * so a switch renders the boundary again and not the figure around it, nor the example it holds,
 * whose elements stay as they were.
 */
export function PageTheme(props: Omit<ThemeProps, 'theme'>) {
  return <Theme {...useTheme()} {...props} />;
}
