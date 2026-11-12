// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm";

export function IconMobileArrowDown({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-297q8 0 15-2.5t13-8.5l104-104q11-11 11.5-27.5T612-508q-11-11-27.5-11.5T556-509l-36 35v-126q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600v126l-36-35q-11-11-27.5-11T348-508q-11 11-11 28t11 28l104 104q6 6 13 8.5t15 2.5Z" : start + "0-80h400v-720H280v720Zm0 0v-720 720Zm200-217q8 0 15-2.5t13-8.5l104-104q11-11 11.5-27.5T612-508q-11-11-27.5-11.5T556-509l-36 35v-126q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600v126l-36-35q-11-11-27.5-11T348-508q-11 11-11 28t11 28l104 104q6 6 13 8.5t15 2.5Z"} /></Icon>;
}
