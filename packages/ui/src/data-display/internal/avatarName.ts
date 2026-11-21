import type { ReactNode } from 'react';

export function nameWithBadge(name: string, badge: ReactNode) {
  return typeof badge === 'string' || typeof badge === 'number' ? `${name}, ${badge}` : name;
}
