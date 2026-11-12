// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M320-420v-40h80q17 0 28.5-11.5T440-500v-60q0-17-11.5-28.5T400-600H290q-13 0-21.5 8.5T260-570q0 13 8.5 21.5T290-540h90v40h-80q-17 0-28.5 11.5T260-460v70q0 13 8.5 21.5T290-360h120q13 0 21.5-8.5T440-390q0-13-8.5-21.5T410-420h-90Zm230 60h110q25 0 42.5-17.5T720-420v-120q0-25-17.5-42.5T660-600H550q-13 0-21.5 8.5T520-570v180q0 13 8.5 21.5T550-360Zm30-60v-120h80v120h-80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z";

export function Icon2d({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h560v-560H200v560Zm0-560v560-560Z"} /></Icon>;
}
