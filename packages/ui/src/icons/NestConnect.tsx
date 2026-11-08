// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M480-200q83 0 141.5-58.5T680-400v-160q0-83-58.5-141.5T480-760q-83 0-141.5 58.5T280-560v160q0 83 58.5 141.5T480-200Zm0-80q-50 0-85-35t-35-85v-160q0-50 35-85t85-35q50 0 85 35t35 85v160q0 50-35 85t-85 35Zm0-280q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560ZM200-40q-33 0-56.5-23.5T120-120v-720q0-33 23.5-56.5T200-920h560q33 0 56.5 23.5T840-840v720q0 33-23.5 56.5T760-40H200Z";

export function IconNestConnect({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h560v-720H200v720Zm0 0v-720 720Z"} /></Icon>;
}
