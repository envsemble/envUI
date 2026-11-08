'use client';

import { createContext, useContext, type ReactNode } from 'react';

const SymbolIconFillContext = createContext<boolean | undefined>(undefined);

/**
 * Whether the symbol icons inside are filled, from the selection of the navigation item or tab that
 * holds them, without adding DOM wrappers.
 */
export function SymbolIconFill({ selected, children }: { selected: boolean; children: ReactNode }) {
  return <SymbolIconFillContext value={selected}>{children}</SymbolIconFillContext>;
}

/** A symbol icon's fill: its own `filled` outside SymbolIconFill; inside it, the selection's. */
export function useSymbolIconFill(filled?: boolean) {
  return useContext(SymbolIconFillContext) ?? filled ?? false;
}
