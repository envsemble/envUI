// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M440-80q-33 0-56.5-23.5T360-160v-160H240q-33 0-56.5-23.5T160-400v-280q0-66 47-113t113-47h440q17 0 28.5 11.5T800-800v400q0 33-23.5 56.5T720-320H600v160q0 33-23.5 56.5T520-80h-80ZM240-560h480v-200h-40v120q0 17-11.5 28.5T640-600q-17 0-28.5-11.5T600-640v-120h-40v40q0 17-11.5 28.5T520-680q-17 0-28.5-11.5T480-720v-40H320q-33 0-56.5 23.5T240-680v120Z";

export function FormatPaint({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0 160h480v-80H240v80Zm0 0v-80 80Z"} /></Icon>;
}
