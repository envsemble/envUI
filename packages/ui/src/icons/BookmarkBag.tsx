// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M430-360q13 0 21.5-8.5T460-390v-10h40v10q0 13 8.5 21.5T530-360q13 0 21.5-8.5T560-390v-10q17 0 28.5-11.5T600-440v-160q0-17-11.5-28.5T560-640h-20v-40q0-17-11.5-28.5T500-720h-40q-17 0-28.5 11.5T420-680v40h-20q-17 0-28.5 11.5T360-600v160q0 17 11.5 28.5T400-400v10q0 13 8.5 21.5T430-360Zm30-280v-40h40v40h-40Zm20 400-168 72q-40 17-76-6.5T200-241v-519q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v519q0 43-36 66.5t-76 6.5l-168-72Z";

export function IconBookmarkBag({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-88 200 86v-518H280v518l200-86Zm0-432H280h400-200Z"} /></Icon>;
}
