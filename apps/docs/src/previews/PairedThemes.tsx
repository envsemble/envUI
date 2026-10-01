import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';

export type Appearance = 'light' | 'dark';

/** Both themes share their topic's state and align matching example rows. */
export function PairedThemes({ children }: { children: (theme: Appearance) => ReactNode }) {
  const appearance = useTheme();
  const themes: Appearance[] = appearance === 'light' ? ['light', 'dark'] : ['dark', 'light'];
  const paneRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(1);
  useLayoutEffect(() => {
    const panes = paneRef.current?.children;
    if (panes?.length) setRows(Math.max(...Array.from(panes, (pane) => pane.children.length)));
  });
  return (
    <div
      ref={paneRef}
      className="docs-paired"
      style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
    >
      {themes.map((theme, index) => (
        <Theme
          key={theme}
          theme={theme}
          className="docs-preview"
          data-side={index === 0 ? 'left' : 'right'}
          style={{ gridRow: `1 / span ${rows}`, gridColumn: index + 1 }}
        >
          {children(theme)}
        </Theme>
      ))}
    </div>
  );
}
