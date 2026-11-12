// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M159-160q-17 0-28-11.5T120-200q0-17 11.5-28.5T160-240h641q17 0 28 11.5t11 28.5q0 17-11.5 28.5T800-160H159Zm";

export function IconViewDay({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "41-160q-33 0-56.5-23.5T120-400v-160q0-33 23.5-56.5T200-640h560q33 0 56.5 23.5T840-560v160q0 33-23.5 56.5T760-320H200Zm-41-400q-17 0-28-11.5T120-760q0-17 11.5-28.5T160-800h641q17 0 28 11.5t11 28.5q0 17-11.5 28.5T800-720H159Z" : start + "0-560q-17 0-28-11.5T120-760q0-17 11.5-28.5T160-800h641q17 0 28 11.5t11 28.5q0 17-11.5 28.5T800-720H159Zm41 400q-33 0-56.5-23.5T120-400v-160q0-33 23.5-56.5T200-640h560q33 0 56.5 23.5T840-560v160q0 33-23.5 56.5T760-320H200Zm0-80h560v-160H200v160Zm0-160v160-160Z"} /></Icon>;
}
