import type { CSSProperties } from 'react';

const gap = { '--space-4': '1.25rem', '--members-gap': '1rem' } as CSSProperties;
const shadow = `0 0 0 1px var(--color-border-strong)`;

export function Member({ muted }: { muted: boolean }) {
  return (
    <div
      style={{
        color: muted ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        padding: 'var(--space-2) var(--space-4)',
        boxShadow: shadow,
        ...gap,
      }}
    />
  );
}

export function highlight(element: HTMLElement) {
  element.style.setProperty('--color-link', 'rebeccapurple');
  return getComputedStyle(element).getPropertyValue('--row-height');
}

// Text that only mentions a name stays: only var(), style keys and style methods are read.
export const note = 'Set --space-4 in your theme.';
