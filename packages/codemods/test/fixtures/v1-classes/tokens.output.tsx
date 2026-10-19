import type { CSSProperties } from 'react';

const gap = { '--env-space-4': '1.25rem', '--members-gap': '1rem' } as CSSProperties;
const shadow = `0 0 0 1px var(--env-color-border-muted)`;

export function Member({ muted }: { muted: boolean }) {
  return (
    <div
      style={{
        color: muted ? 'var(--env-color-fg-muted)' : 'var(--env-color-fg-default)',
        padding: 'var(--env-space-2) var(--env-space-4)',
        boxShadow: shadow,
        ...gap,
      }}
    />
  );
}

export function highlight(element: HTMLElement) {
  element.style.setProperty('--env-color-fg-link', 'rebeccapurple');
  return getComputedStyle(element).getPropertyValue('--env-row-height');
}

// Text that only mentions a name stays: only var(), style keys and style methods are read.
export const note = 'Set --space-4 in your theme.';
