// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M120-240v-160q0-17 11.5-28.5T160-440h240q17 0 28.5 11.5T440-400v160q0 17-11.5 28.5T400-200H160q-17 0-28.5-11.5T120-240Zm400 0v-160q0-17 11.5-28.5T560-440h240q17 0 28.5 11.5T840-400v160q0 17-11.5 28.5T800-200H560q-17 0-28.5-11.5T520-240ZM120-560v-160q0-17 11.5-28.5T160-760h240q17 0 28.5 11.5T440-720v160q0 17-11.5 28.5T400-520H160q-17 0-28.5-11.5T120-560Zm400 0v-160q0-17 11.5-28.5T560-760h240q17 0 28.5 11.5T840-720v160q0 17-11.5 28.5T800-520H560q-17 0-28.5-11.5T520-560Z";

export function IconTileSmall({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "M200-280h160v-80H200v80Zm400 0h160v-80H600v80ZM200-600h160v-80H200v80Zm80 280Zm400 0ZM280-640Z"} /></Icon>;
}
