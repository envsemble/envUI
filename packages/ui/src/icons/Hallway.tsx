// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h120l132-132q12-12 28-12t28 12l132 132h120q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm";

export function IconHallway({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "250-200-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11h400q12 0 18-11t-2-21L586-419q-6-8-16-8t-16 8L450-280Zm-46-520h152l-76-76-76 76Z" : start + "0-80h560v-560H200v560Zm250-120-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11h400q12 0 18-11t-2-21L586-419q-6-8-16-8t-16 8L450-280Zm-46-520h152l-76-76-76 76ZM200-160v-560 560Z"} /></Icon>;
}
