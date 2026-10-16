import type { ReactNode } from 'react';

/** Shared sizing wrapper that hides decorative icons from assistive technology. */
export function DecorativeIcon({ children }: { children: ReactNode }) {
  return (
    <span className="env-icon" aria-hidden="true">
      {children}
    </span>
  );
}
