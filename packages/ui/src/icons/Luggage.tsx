// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M280-120q-33 0-56.5-23.5T200-200v-440q0-33 23.5-56.5T280-720h80v-80q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v80h80q33 0 56.5 23.5T760-640v440q0 33-23.5 56.5T680-120q0 17-11.5 28.5T640-80q-17 0-28.5-11.5T600-120H360q0 17-11.5 28.5T320-80q-17 0-28.5-11.5T280-120Zm";

export function IconLuggage({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "120-480q-17 0-28.5 11.5T360-560v280q0 17 11.5 28.5T400-240q17 0 28.5-11.5T440-280v-280q0-17-11.5-28.5T400-600Zm160 0q-17 0-28.5 11.5T520-560v280q0 17 11.5 28.5T560-240q17 0 28.5-11.5T600-280v-280q0-17-11.5-28.5T560-600ZM440-720h80v-80h-80v80Z" : start + "0-80h400v-440H280v440Zm120-400q-17 0-28.5 11.5T360-560v280q0 17 11.5 28.5T400-240q17 0 28.5-11.5T440-280v-280q0-17-11.5-28.5T400-600Zm160 0q-17 0-28.5 11.5T520-560v280q0 17 11.5 28.5T560-240q17 0 28.5-11.5T600-280v-280q0-17-11.5-28.5T560-600ZM440-720h80v-80h-80v80Zm40 300Z"} /></Icon>;
}
