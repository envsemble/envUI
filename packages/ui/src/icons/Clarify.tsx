// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M280-280h200q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360H280q-17 0-28.5 11.5T240-320q0 17 11.5 28.5T280-280Zm400-400q-17 0-28.5 11.5T640-640v320q0 17 11.5 28.5T680-280q17 0 28.5-11.5T720-320v-320q0-17-11.5-28.5T680-680ZM280-440h200q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520H280q-17 0-28.5 11.5T240-480q0 17 11.5 28.5T280-440Zm0-160h200q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680H280q-17 0-28.5 11.5T240-640q0 17 11.5 28.5T280-600ZM160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Z";

export function Clarify({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h640v-560H160v560Zm0 0v-560 560Z"} /></Icon>;
}
