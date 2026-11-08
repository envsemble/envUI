// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm";

export function IconMobileArrowUpRight({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "240-424v64q0 17 11.5 28.5T560-360q17 0 28.5-11.5T600-400v-160q0-17-11.5-28.5T560-600H400q-17 0-28.5 11.5T360-560q0 17 11.5 28.5T400-520h64l-96 95q-12 12-12 28.5t12 28.5q12 12 28.5 12t28.5-12l95-96Z" : start + "0-80h400v-720H280v720Zm0 0v-720 720Zm240-344v64q0 17 11.5 28.5T560-360q17 0 28.5-11.5T600-400v-160q0-17-11.5-28.5T560-600H400q-17 0-28.5 11.5T360-560q0 17 11.5 28.5T400-520h64l-96 95q-12 12-12 28.5t12 28.5q12 12 28.5 12t28.5-12l95-96Z"} /></Icon>;
}
