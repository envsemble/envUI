// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M280-440v320q0 17-11.5 28.5T240-80q-17 0-28.5-11.5T200-120v-680q0-17 11.5-28.5T240-840h541q11 0 19.5 5t13.5 13q5 8 6.5 17.5T818-785l-58 145 58 145q4 10 2.5 19.5T814-458q-5 8-13.5 13t-19.5 5H280Z";

export function IconFlag2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h442l-36-90q-6-14-6-30t6-30l36-90H280v240Zm0 0v-240 240Z"} /></Icon>;
}
