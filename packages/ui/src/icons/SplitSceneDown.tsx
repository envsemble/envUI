// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M160-800q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v160q0 17-11.5 28.5T760-600";

export function IconSplitSceneDown({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "H200q-17 0-28.5-11.5T160-640v-160ZM80-480q0-17 11.5-28.5T120-520h720q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440h-40v280q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160v-280h-40q-17 0-28.5-11.5T80-480Z" : start + "q-17 0-28.5-11.5T720-640v-160H240v160q0 17-11.5 28.5T200-600q-17 0-28.5-11.5T160-640v-160ZM80-480q0-17 11.5-28.5T120-520h720q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440h-40v280q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160v-280h-40q-17 0-28.5-11.5T80-480Zm160-320h480-480Z"} /></Icon>;
}
