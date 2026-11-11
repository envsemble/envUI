// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M440-430v-90h140q12 0 18-11t-2-21l-36-48 36-48q8-10 2-21t-18-11H420q-17 0-28.5 11.5T380-640v210q0 13 8.5 21.5T410-400q13 0 21.5-8.5T440-430Zm40 190-168 72q-40 17-76-6.5T200-241v-519q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v519q0 43-36 66.5t-76 6.5l-168-72Z";

export function IconBookmarkFlag({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-88 200 86v-518H280v518l200-86Zm0-432H280h400-200Z"} /></Icon>;
}
