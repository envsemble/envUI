'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ControlSize } from './controlTypes.js';

/** The emphasis of a button: its variant. */
export type ControlVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';

/**
 * Defaults a container gives the buttons the application puts in its slots, such as the actions of
 * a toolbar or a title bar, which take the ghost variant there. A button's own prop always wins.
 */
export interface ControlDefaultsValue {
  /** The variant of a Button or IconButton that sets none. */
  variant?: ControlVariant;
  /** The size of a Button or IconButton that sets none. */
  size?: ControlSize;
}

const ControlDefaultsContext = createContext<ControlDefaultsValue>({});

/**
 * Gives the buttons inside it a default variant and size, which they take only where they set
 * none. Nested defaults merge, the inner winning.
 */
export function ControlDefaults({
  variant,
  size,
  children,
}: ControlDefaultsValue & { children?: ReactNode }) {
  const outer = useContext(ControlDefaultsContext);
  const value = useMemo(
    () => ({ variant: variant ?? outer.variant, size: size ?? outer.size }),
    [variant, size, outer.variant, outer.size],
  );
  return <ControlDefaultsContext value={value}>{children}</ControlDefaultsContext>;
}

/** The defaults of the nearest ControlDefaults, or none. */
export function useControlDefaults(): ControlDefaultsValue {
  return useContext(ControlDefaultsContext);
}
