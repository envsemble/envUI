import type { MouseEvent, ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';

/** Link specimens retain native link semantics without navigating out of the demo. */
function preventExampleNavigation(event: MouseEvent<HTMLDivElement>) {
  if (event.target instanceof Element && event.target.closest('a[href]')) {
    event.preventDefault();
  }
}

/** One specimen area that follows the documentation's current theme. */
export function Preview({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Theme
      theme={theme}
      className="docs-preview"
      onClickCapture={preventExampleNavigation}
      onAuxClickCapture={preventExampleNavigation}
    >
      {children}
    </Theme>
  );
}
