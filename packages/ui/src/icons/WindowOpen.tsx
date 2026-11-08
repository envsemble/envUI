// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M240-120q-33 0-56.5-23.5T160-200v-560q0-33 23.5-56.5T240-840h480q33 0 56.5 23.5T800-760v560q0 33-23.5 56.5T720-120H240Zm";

export function IconWindowOpen({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "40-400h160v-20q0-8 6-14t14-6h40q8 0 14 6t6 14v20h160v-200H280v200Zm-40 320h480v-560H240v560Z" : start + "0-400h200v-20q0-8 6-14t14-6h40q8 0 14 6t6 14v20h200v-240H240v240Zm0 320h480-480Z"} /></Icon>;
}
