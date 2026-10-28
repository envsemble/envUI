// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M640-260q25 0 42.5-17.5T700-320q0-25-17.5-42.5T640-380q-25 0-42.5 17.5T580-320q0 25 17.5 42.5T640-260ZM480-420q25 0 42.5-17.5T540-480q0-25-17.5-42.5T480-540q-25 0-42.5 17.5T420-480q0 25 17.5 42.5T480-420ZM320-580q25 0 42.5-17.5T380-640q0-25-17.5-42.5T320-700q-25 0-42.5 17.5T260-640q0 25 17.5 42.5T320-580ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z";

export function Ifl({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h560v-560H200v560Zm0-560v560-560Z"} /></Icon>;
}
