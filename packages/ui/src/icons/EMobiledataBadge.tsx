// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm";

export function IconEMobiledataBadge({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "400-160q17 0 28.5-11.5T640-320q0-17-11.5-28.5T600-360H400v-80h160q17 0 28.5-11.5T600-480q0-17-11.5-28.5T560-520H400v-80h200q17 0 28.5-11.5T640-640q0-17-11.5-28.5T600-680H360q-17 0-28.5 11.5T320-640v320q0 17 11.5 28.5T360-280h240Z" : start + "0-80h560v-560H200v560Zm0-560v560-560Zm400 480q17 0 28.5-11.5T640-320q0-17-11.5-28.5T600-360H400v-80h160q17 0 28.5-11.5T600-480q0-17-11.5-28.5T560-520H400v-80h200q17 0 28.5-11.5T640-640q0-17-11.5-28.5T600-680H360q-17 0-28.5 11.5T320-640v320q0 17 11.5 28.5T360-280h240Z"} /></Icon>;
}
