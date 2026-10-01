import type { ReactNode } from 'react';

/** Shared sizing wrapper for icons that accompany visible text. */
export function DecorativeIcon({ children }: { children: ReactNode }) {
  return (
    <span className="env-symbol" aria-hidden="true">
      {children}
    </span>
  );
}
