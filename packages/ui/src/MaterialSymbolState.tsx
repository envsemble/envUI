'use client';

import { createContext, useContext, type ReactNode } from 'react';

const MaterialSymbolFillContext = createContext<boolean | undefined>(undefined);

/** Selection in navigation and tabs owns icon fill, without adding DOM wrappers. */
export function NavigationIconState({
  selected,
  children,
}: {
  selected: boolean;
  children: ReactNode;
}) {
  return <MaterialSymbolFillContext value={selected}>{children}</MaterialSymbolFillContext>;
}

/** Explicit fill applies outside selection controls; inside them, selection is authoritative. */
export function useMaterialSymbolFill(filled?: boolean) {
  return useContext(MaterialSymbolFillContext) ?? filled ?? false;
}
