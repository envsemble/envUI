// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-280H200v280Zm";

export function IconTabs({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "480-440q17 0 28.5-11.5T720-680q0-17-11.5-28.5T680-720H520q-17 0-28.5 11.5T480-680q0 17 11.5 28.5T520-640h160Z" : start + "0-360h560v-200H200v200Zm480-80q17 0 28.5-11.5T720-680q0-17-11.5-28.5T680-720H520q-17 0-28.5 11.5T480-680q0 17 11.5 28.5T520-640h160Zm-480 80v-200 200Z"} /></Icon>;
}
