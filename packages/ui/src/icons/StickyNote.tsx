// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v407q0 16-6 30.5T817-297L663-143q-11 11-25.5 17t-30.5 6H200Zm400-80";

export function IconStickyNote({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + " 160-160h-80q-33 0-56.5 23.5T600-280v80ZM480-320q17 0 28.5-11.5T520-360v-200h80q17 0 28.5-11.5T640-600q0-17-11.5-28.5T600-640H360q-17 0-28.5 11.5T320-600q0 17 11.5 28.5T360-560h80v200q0 17 11.5 28.5T480-320Z" : start + "v-80q0-33 23.5-56.5T680-360h80v-400H200v560h400ZM440-560v200q0 17 11.5 28.5T480-320q17 0 28.5-11.5T520-360v-200h80q17 0 28.5-11.5T640-600q0-17-11.5-28.5T600-640H360q-17 0-28.5 11.5T320-600q0 17 11.5 28.5T360-560h80Zm160 360Zm-400 0v-560 560Z"} /></Icon>;
}
