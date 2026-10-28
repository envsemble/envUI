// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M200-80q-33 0-56.5-23.5T120-160v-495q0-25 13.5-45.5T170-730l320-128q40-16 75 8t35 67v63q33 0 56.5 23.5T680-640v";

export function BooksMoviesAndMusic({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "80q-117 0-198.5 81.5T400-280q0 57 22 109t63 91H200Zm160-640h160v-62l-160 62ZM680-80q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80Zm-19-119 102-64q10-6 10-17t-10-17l-102-64q-10-6-20.5-.5T630-344v128q0 12 10.5 17.5t20.5-.5Z" : start + "40q0 17-11.5 28.5T640-560q-17 0-28.5-11.5T600-600v-40H200v480h167q17 0 28.5 11.5T407-120q0 17-11.5 28.5T367-80H200Zm160-640h160v-62l-160 62ZM680-80q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80Zm-19-119 102-64q10-6 10-17t-10-17l-102-64q-10-6-20.5-.5T630-344v128q0 12 10.5 17.5t20.5-.5Zm-461 39v-480 480Z"} /></Icon>;
}
