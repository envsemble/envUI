// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M144-120q-35 0-52-30t0-60l336-580q9-15 23-22.5t29-7.5q15 0 29 7.5t23 22.5l336 580q17 30 0 60t-52 30H144Zm";

export function AddTriangle({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "296-200v40q0 17 11.5 28.5T480-240q17 0 28.5-11.5T520-280v-40h40q17 0 28.5-11.5T600-360q0-17-11.5-28.5T560-400h-40v-40q0-17-11.5-28.5T480-480q-17 0-28.5 11.5T440-440v40h-40q-17 0-28.5 11.5T360-360q0 17 11.5 28.5T400-320h40Z" : start + "35-80h602L480-720 179-200Zm261-120v40q0 17 11.5 28.5T480-240q17 0 28.5-11.5T520-280v-40h40q17 0 28.5-11.5T600-360q0-17-11.5-28.5T560-400h-40v-40q0-17-11.5-28.5T480-480q-17 0-28.5 11.5T440-440v40h-40q-17 0-28.5 11.5T360-360q0 17 11.5 28.5T400-320h40Zm40-40Z"} /></Icon>;
}
