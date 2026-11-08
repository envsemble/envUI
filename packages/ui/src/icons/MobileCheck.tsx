// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm";

export function IconMobileCheck({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "162-432-28-28q-11-11-28-11t-28 11q-11 11-11 28t11 28l56 56q12 12 28 12t28-12l142-142q11-11 11-28t-11-28q-11-11-28-11t-28 11L442-472Z" : start + "0-80h400v-720H280v720Zm0 0v-720 720Zm162-352-28-28q-11-11-28-11t-28 11q-11 11-11 28t11 28l56 56q12 12 28 12t28-12l142-142q11-11 11-28t-11-28q-11-11-28-11t-28 11L442-472Z"} /></Icon>;
}
