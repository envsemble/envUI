// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-120q-33 0-56.5-23.5T80-200v-200q0-33 23.5-56.5T160-480h166q15 0 26 10t13 24q5 34 40 60t75 26q40 0 75-26t40-60q2-14 13-24t26-10h166q33 0 56.5 23.5T880-400v200q0 33-23.5 56.5T800-120H160Zm";

export function Upcoming({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "516-436q-11-11-11-28t11-28l86-86q11-11 28-11t28 11q11 11 11 28t-11 28l-86 86q-11 11-28 11t-28-11Zm-392 0q-11 11-28 11t-28-11l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l86 86q11 11 11 28t-11 28Zm196-84q-17 0-28.5-11.5T440-680v-120q0-17 11.5-28.5T480-840q17 0 28.5 11.5T520-800v120q0 17-11.5 28.5T480-640Z" : start + "0-80h640v-200H664q-25 55-74.5 87.5T480-280q-60 0-109.5-32.5T296-400H160v200Zm516-356q-11-11-11-28t11-28l86-86q11-11 28-11t28 11q11 11 11 28t-11 28l-86 86q-11 11-28 11t-28-11Zm-392 0q-11 11-28 11t-28-11l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l86 86q11 11 11 28t-11 28Zm196-84q-17 0-28.5-11.5T440-680v-120q0-17 11.5-28.5T480-840q17 0 28.5 11.5T520-800v120q0 17-11.5 28.5T480-640ZM160-200h640-640Z"} /></Icon>;
}
