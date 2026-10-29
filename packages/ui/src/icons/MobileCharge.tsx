// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm";

export function IconMobileCharge({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "180-400v118q0 8 7.5 9.5T479-318l87-173q5-10-1-19.5t-17-9.5h-48v-118q0-8-7.5-9.5T481-642l-87 173q-5 10 1 19.5t17 9.5h48Z" : start + "0-80h400v-720H280v720Zm0 0v-720 720Zm180-320v118q0 8 7.5 9.5T479-318l87-173q5-10-1-19.5t-17-9.5h-48v-118q0-8-7.5-9.5T481-642l-87 173q-5 10 1 19.5t17 9.5h48Z"} /></Icon>;
}
