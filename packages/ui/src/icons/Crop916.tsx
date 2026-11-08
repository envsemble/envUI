// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M360-120q-33 0-56.5-23.5T280-200v-560q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760v560q0 33-23.5 56.5T600-120H360Z";

export function IconCrop916({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-640v560h240v-560H360Zm0 0v560-560Z"} /></Icon>;
}
