// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M280-80q-33 0-56.5-23.5T200-160v-80q0-33 23.5-56.5T280-320v-200q-33 0-56.5-23.5T200-600v-80q0-33 23.5-56.5T280-760h120v-40q-17 0-28.5-11.5T360-840q0-17 11.5-28.5T400-880h160q17 0 28.5 11.5T600-840q0 17-11.5 28.5T560-800v40h120q33 0 56.5 23.5T760-680v80q0 33-23.5 56.5T680-520v200q33 0 56.5 23.5T760-240v80q0 33-23.5 56.5T680-80H280Z";

export function IconWaterBottleLarge({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h400v-80h-80v-280h-40q-17 0-28.5-11.5T520-560q0-17 11.5-28.5T560-600h120v-80H280v80h80v280h40q17 0 28.5 11.5T440-280q0 17-11.5 28.5T400-240H280v80Zm200-260Z"} /></Icon>;
}
