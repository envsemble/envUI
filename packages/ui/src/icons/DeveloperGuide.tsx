// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm";

export function DeveloperGuide({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "280-640v245q0 12 10 17.5t20-.5l49-30q10-6 21-6t21 6l49 30q10 6 20 .5t10-17.5v-245H480Z" : start + "0-640v560h560v-560h-80v245q0 12-10 17.5t-20-.5l-49-30q-10-6-21-6t-21 6l-49 30q-10 6-20 .5T480-515v-245H200Zm0 560v-560 560Z"} /></Icon>;
}
