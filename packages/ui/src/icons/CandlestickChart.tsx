// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M280-200v-40h-40q-17 0-28.5-11.5T200-280v-400q0-17 11.5-28.5T240-720h40v-40q0-17 11.5-28.5T320-800q17 0 28.5 11.5T360-760v40h40q17 0 28.5 11.5T440-680v400q0 17-11.5 28.5T400-240h-40v40q0 17-11.5 28.5T320-160q-17 0-28.5-11.5T280-200Zm";

export function IconCandlestickChart({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "320 0v-160h-40q-17 0-28.5-11.5T520-400v-200q0-17 11.5-28.5T560-640h40v-120q0-17 11.5-28.5T640-800q17 0 28.5 11.5T680-760v120h40q17 0 28.5 11.5T760-600v200q0 17-11.5 28.5T720-360h-40v160q0 17-11.5 28.5T640-160q-17 0-28.5-11.5T600-200Z" : start + "0-120h80v-320h-80v320Zm320 120v-160h-40q-17 0-28.5-11.5T520-400v-200q0-17 11.5-28.5T560-640h40v-120q0-17 11.5-28.5T640-800q17 0 28.5 11.5T680-760v120h40q17 0 28.5 11.5T760-600v200q0 17-11.5 28.5T720-360h-40v160q0 17-11.5 28.5T640-160q-17 0-28.5-11.5T600-200Zm0-240h80v-120h-80v120Zm-280-40Zm320-20Z"} /></Icon>;
}
