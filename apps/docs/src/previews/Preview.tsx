import type { ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';

/** One specimen area that follows the documentation's current theme. */
export function Preview({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Theme theme={theme} className="docs-preview">
      {children}
    </Theme>
  );
}
