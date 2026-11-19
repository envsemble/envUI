'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface RowControlIds {
  labelId: string;
  descriptionId: string | undefined;
}

const RowControlContext = createContext<RowControlIds | null>(null);

export function RowControlProvider({
  labelId,
  descriptionId,
  children,
}: RowControlIds & { children: ReactNode }) {
  return <RowControlContext value={{ labelId, descriptionId }}>{children}</RowControlContext>;
}

interface OwnNaming {
  label?: unknown;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function useRowControlNaming(own: OwnNaming): {
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
} {
  const row = useContext(RowControlContext);
  const named = own.label != null || own['aria-label'] != null || own['aria-labelledby'] != null;
  if (named || !row) return {};
  return {
    'aria-labelledby': row.labelId,
    'aria-describedby':
      [row.descriptionId, own['aria-describedby']].filter(Boolean).join(' ') || undefined,
  };
}
