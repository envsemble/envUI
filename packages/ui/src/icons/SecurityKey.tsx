// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M400-40q-33 0-56.5-23.5T320-120v-120q-33 0-56.5-23.5T240-320v-520q0-33 23.5-56.5T320-920h320q33 0 56.5 23.5T720-840v520q0 33-23.5 56.5T640-240v120q0 33-23.5 56.5T560-40H400Zm80-420q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm-80 340h160v-120H400v120Zm";

export function IconSecurityKey({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "80-420q-17 0-28.5-11.5T440-580q0-17 11.5-28.5T480-620q17 0 28.5 11.5T520-580q0 17-11.5 28.5T480-540Z" : start + "-80-200h320v-520H320v520Zm160-220q-17 0-28.5-11.5T440-580q0-17 11.5-28.5T480-620q17 0 28.5 11.5T520-580q0 17-11.5 28.5T480-540ZM320-320h320-320Z"} /></Icon>;
}
