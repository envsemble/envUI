// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M280-280q17 0 28.5-11.5T320-320q0-17-11.5-28.5T280-360q-17 0-28.5 11.5T240-320q0 17 11.5 28.5T280-280Zm0-400q-17 0-28.5 11.5T240-640v160q0 17 11.5 28.5T280-440q17 0 28.5-11.5T320-480v-160q0-17-11.5-28.5T280-680Zm400 400q17 0 28.5-11.5T720-320q0-17-11.5-28.5T680-360H480q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280h200Zm0-160q17 0 28.5-11.5T720-480q0-17-11.5-28.5T680-520H480q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440h200Zm0-160q17 0 28.5-11.5T720-640q0-17-11.5-28.5T680-680H480q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600h200ZM160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Z";

export function IconBreakingNews({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h640v-560H160v560Zm0 0v-560 560Z"} /></Icon>;
}
