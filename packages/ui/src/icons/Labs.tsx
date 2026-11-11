// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-141.5-58.5T280-280v-360q-33 0-56.5-23.5T200-720v-80q0-33 23.5-56.5T280-880h400q33 0 56.5 23.5T760-800v80q0 33-23.5 56.5T680-640v360q0 83-58.5 141.5T480-80Z";

export function IconLabs({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m0-80q50 0 85-35t35-85h-80q-17 0-28.5-11.5T480-320q0-17 11.5-28.5T520-360h80v-80h-80q-17 0-28.5-11.5T480-480q0-17 11.5-28.5T520-520h80v-120H360v360q0 50 35 85t85 35Z" : start + "M280-720h400v-80H280v80Zm200 560q50 0 85-35t35-85h-80q-17 0-28.5-11.5T480-320q0-17 11.5-28.5T520-360h80v-80h-80q-17 0-28.5-11.5T480-480q0-17 11.5-28.5T520-520h80v-120H360v360q0 50 35 85t85 35ZM280-720v-80 80Z"} /></Icon>;
}
