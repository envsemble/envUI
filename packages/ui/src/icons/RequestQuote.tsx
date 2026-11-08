// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M440-240v20q0 8 6 14t14 6h40q8 0 14-6t6-14v-20h40q17 0 28.5-11.5T600-280v-120q0-17-11.5-28.5T560-440H440v-40h120q17 0 28.5-11.5T600-520q0-17-11.5-28.5T560-560h-40v-20q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14v20h-40q-17 0-28.5 11.5T360-520v120q0 17 11.5 28.5T400-360h120v40H400q-17 0-28.5 11.5T360-280q0 17 11.5 28.5T400-240h40ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h360l200 200v520q0 33-23.5 56.5T720-80H240Zm";

export function IconRequestQuote({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "320-720v120q0 17 11.5 28.5T600-640h120L560-800Z" : start + "0-80h480v-480H600q-17 0-28.5-11.5T560-680v-120H240v640Zm0-640v160-160 640-640Z"} /></Icon>;
}
