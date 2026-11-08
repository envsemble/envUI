// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm";

export function IconMobileScreensaver({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "340-320q6 0 9-5.5t-1-10.5l-85-113q-3-4-8-4t-8 4l-67 89-47-63q-3-4-8-4t-8 4l-65 87q-4 5-1 10.5t9 5.5h280Zm-20-200q17 0 28.5-11.5T640-600q0-17-11.5-28.5T600-640q-17 0-28.5 11.5T560-600q0 17 11.5 28.5T600-560Z" : start + "0-80h400v-720H280v720Zm340-240q6 0 9-5.5t-1-10.5l-85-113q-3-4-8-4t-8 4l-67 89-47-63q-3-4-8-4t-8 4l-65 87q-4 5-1 10.5t9 5.5h280Zm-20-200q17 0 28.5-11.5T640-600q0-17-11.5-28.5T600-640q-17 0-28.5 11.5T560-600q0 17 11.5 28.5T600-560ZM280-120v-720 720Z"} /></Icon>;
}
