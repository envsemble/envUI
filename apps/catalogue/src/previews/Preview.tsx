import type { MouseEvent, ReactNode } from 'react';
import { Column, Theme, useTheme } from '@envsemble/envui';

/** Link specimens retain native link semantics without navigating out of the demo. */
function preventExampleNavigation(event: MouseEvent<HTMLDivElement>) {
  if (event.target instanceof Element && event.target.closest('a[href]')) {
    event.preventDefault();
  }
}

/**
 * One specimen area in the documentation's current theme, around the stages that show examples in
 * the opposite one; `specimen` names the catalogue specimen it shows, so the visual baseline can
 * name an untitled one's image after it.
 */
export function Preview({ specimen, children }: { specimen?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <Column
      render={<Theme {...theme} />}
      gap={0}
      className="docs-preview"
      data-specimen={specimen}
      onClickCapture={preventExampleNavigation}
      onAuxClickCapture={preventExampleNavigation}
    >
      {children}
    </Column>
  );
}
