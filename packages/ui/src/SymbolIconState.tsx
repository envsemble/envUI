'use client';

import { createContext, useContext, type ReactNode } from 'react';

const SymbolIconFillContext = createContext<boolean | undefined>(undefined);

/** Selection in navigation and tabs owns icon fill, without adding DOM wrappers. */
export function NavigationIconState({
  selected,
  children,
}: {
  selected: boolean;
  children: ReactNode;
}) {
  return <SymbolIconFillContext value={selected}>{children}</SymbolIconFillContext>;
}

/** Explicit fill applies outside selection controls; inside them, selection is authoritative. */
export function useSymbolIconFill(filled?: boolean) {
  return useContext(SymbolIconFillContext) ?? filled ?? false;
}
