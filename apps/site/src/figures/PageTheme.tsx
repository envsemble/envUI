import { Theme, useTheme, type ThemeProps } from '@envsemble/envui';

export function PageTheme(props: Omit<ThemeProps, 'theme'>) {
  return <Theme {...useTheme()} {...props} />;
}
