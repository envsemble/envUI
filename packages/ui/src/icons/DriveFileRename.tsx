// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M449-280h231q17 0 28.5-11.5T720-320q0-17-11.5-28.5T680-360H529l-80 80Zm-169 0h66q8 0 15.5-3t13.5-9l248-248q9-9 13-20.5t4-22.5q0-11-4.5-22T623-625l-37-37q-9-9-20-13.5t-23-4.5q-11 0-22 4t-20 13L252-415q-6 6-9 13.5t-3 15.5v66q0 17 11.5 28.5T280-280Zm";

export function IconDriveFileRename({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "263-264-38-38 38-38 37 37-37 39ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z" : start + "300-303-37-37 37 37ZM300-340v-38l162-161 19 18 18 19-161 162h-38Zm181-181 18 19-37-37 19 18ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"} /></Icon>;
}
