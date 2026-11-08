// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "m233-160 16 16q11 11 11 27.5T248-88q-11 11-28 11t-28-11l-84-84q-6-6-8.5-13T97-200q0-8 2.5-15t8.5-13l84-84q11-11 27.5-11t28.5 11q12 12 12 28.5T248-255l-15 15h494l-16-16q-11-11-11-27.5t12-28.5q11-11 28-11t28 11l84 84q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13l-84 84q-11 11-27.5 11T712-88q-12-12-12-28.5t12-28.5l15-15H233Zm247-360q";

export function IconMoneyRange({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM200-400q-33 0-56.5-23.5T120-480v-320q0-33 23.5-56.5T200-880h560q33 0 56.5 23.5T840-800v320q0 33-23.5 56.5T760-400H200Zm0-80h80q0-33-23.5-56.5T200-560v80Zm480 0h80v-80q-33 0-56.5 23.5T680-480Zm80-240v-80h-80q0 33 23.5 56.5T760-720Zm-560 0q33 0 56.5-23.5T280-800h-80v80Z" : start + "-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-400q-33 0-56.5-23.5T120-480v-320q0-33 23.5-56.5T200-880h560q33 0 56.5 23.5T840-800v320q0 33-23.5 56.5T760-400H200Zm80-80h400q0-33 23.5-56.5T760-560v-160q-33 0-56.5-23.5T680-800H280q0 33-23.5 56.5T200-720v160q33 0 56.5 23.5T280-480Zm-80 0v-320 320Z"} /></Icon>;
}
