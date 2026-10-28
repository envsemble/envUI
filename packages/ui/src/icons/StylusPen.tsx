// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "m254-371 78-280q4-13 14-21t24-8h30v-44q0-8 1.5-15.5T406-755l49-114q2-5 7-8t10-3h16q5 0 10 3t7 8l49 114q3 8 4.5 15.5T560-724v44h30q14 0 24 8t14 21l78 280q5 19-7 35t-32 16H293q-20 0-32-16t-7-35Zm";

export function StylusPen({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-39 251q-20 0-32.5-16.5T177-173l5-12q8-25 29-40t47-15h444q26 0 47 15t29 40l5 12q7 20-5.5 36.5T745-120H215Z" : start + "91-29h270l-56-200H401l-56 200Zm0 0h270-270ZM215-120q-20 0-32.5-16.5T177-173l5-12q8-25 29-40t47-15h444q26 0 47 15t29 40l5 12q7 20-5.5 36.5T745-120H215Z"} /></Icon>;
}
