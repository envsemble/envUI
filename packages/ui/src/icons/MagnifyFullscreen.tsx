// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function MagnifyFullscreen({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "400-320v40q0 17 11.5 28.5T600-400q17 0 28.5-11.5T640-440v-40h40q17 0 28.5-11.5T720-520q0-17-11.5-28.5T680-560h-40v-40q0-17-11.5-28.5T600-640q-17 0-28.5 11.5T560-600v40h-40q-17 0-28.5 11.5T480-520q0 17 11.5 28.5T520-480h40Z" : start + "0-80h640v-480H160v480Zm0 0v-480 480Zm400-240v40q0 17 11.5 28.5T600-400q17 0 28.5-11.5T640-440v-40h40q17 0 28.5-11.5T720-520q0-17-11.5-28.5T680-560h-40v-40q0-17-11.5-28.5T600-640q-17 0-28.5 11.5T560-600v40h-40q-17 0-28.5 11.5T480-520q0 17 11.5 28.5T520-480h40Z"} /></Icon>;
}
