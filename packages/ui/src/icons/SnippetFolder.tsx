// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm";

export function IconSnippetFolder({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "420-180v-200h55l65 65v135H580Zm-20 60h160q17 0 28.5-11.5T760-320v-163q0-8-3-15.5t-9-13.5l-76-76q-6-6-13.5-9t-15.5-3h-83q-17 0-28.5 11.5T520-560v240q0 17 11.5 28.5T560-280Z" : start + "0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Zm420-100v-200h55l65 65v135H580Zm-20 60h160q17 0 28.5-11.5T760-320v-163q0-8-3-15.5t-9-13.5l-76-76q-6-6-13.5-9t-15.5-3h-83q-17 0-28.5 11.5T520-560v240q0 17 11.5 28.5T560-280Z"} /></Icon>;
}
