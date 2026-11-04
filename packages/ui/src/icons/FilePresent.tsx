// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M480-200q67 0 113.5-47T640-360v-120q0-17-11.5-28.5T600-520q-17 0-28.5 11.5T560-480v120q0 33-23 56.5T480-280q-33 0-56.5-23.5T400-360v-220q0-9 6-14.5t14-5.5q9 0 14.5 5.5T440-580v180q0 17 11.5 28.5T480-360q17 0 28.5-11.5T520-400v-180q0-42-29-71t-71-29q-42 0-71 29t-29 71v220q0 66 47 113t113 47ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h360l200 200v520q0 33-23.5 56.5T720-80H240Zm";

export function IconFilePresent({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "320-720v120q0 17 11.5 28.5T600-640h120L560-800Z" : start + "0-80h480v-480H600q-17 0-28.5-11.5T560-680v-120H240v640Zm0-640v160-160 640-640Z"} /></Icon>;
}
