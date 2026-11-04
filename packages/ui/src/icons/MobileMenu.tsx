// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M320-40q-17 0-28.5-11.5T280-80q0-17 11.5-28.5T320-120q17 0 28.5 11.5T360-80q0 17-11.5 28.5T320-40Zm160 0q-17 0-28.5-11.5T440-80q0-17 11.5-28.5T480-120q17 0 28.5 11.5T520-80q0 17-11.5 28.5T480-40Zm160 0q-17 0-28.5-11.5T600-80q0-17 11.5-28.5T640-120q17 0 28.5 11.5T680-80q0 17-11.5 28.5T640-40Z";

export function IconMobileMenu({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M480-720q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720Zm240-120v82q17 3 28.5 16.5T760-711v62q0 17-11.5 30.5T720-602v322q0 33-23.5 56.5T640-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h320q33 0 56.5 23.5T720-840Z" : start + "m0-240v-560H320v560h320ZM480-720q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720ZM320-280v-560 560Zm400-560v82q17 3 28.5 16.5T760-711v62q0 17-11.5 30.5T720-602v322q0 33-23.5 56.5T640-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h320q33 0 56.5 23.5T720-840Z"} /></Icon>;
}
