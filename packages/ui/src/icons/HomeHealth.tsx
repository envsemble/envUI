// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M420-380v40q0 25 17.5 42.5T480-280q25 0 42.5-17.5T540-340v-40h40q25 0 42.5-17.5T640-440q0-25-17.5-42.5T580-500h-40v-40q0-25-17.5-42.5T480-600q-25 0-42.5 17.5T420-540v40h-40q-25 0-42.5 17.5T320-440q0 25 17.5 42.5T380-380h40ZM240-120q-33 0-56.5-23.5T160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H240Z";

export function IconHomeHealth({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h480v-360L480-740 240-560v360Zm240-270Z"} /></Icon>;
}
