// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm";

export function PhotoAlbum({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-200-49-65q-6-8-16.5-8t-16.5 8l-55 74q-7 10-1.5 20.5T319-240h321q12 0 17.5-10.5T656-272l-95-126q-6-8-16-8t-16 8l-89 118Zm0-520v245q0 12 9.5 17.5t20.5-.5l49-29q10-6 20.5-6t20.5 6l49 29q11 6 21 .5t10-17.5v-245H440Z" : start + "0-80h480v-640h-80v245q0 12-10 17.5t-20-.5l-49-30q-10-6-20.5-6t-20.5 6l-49 30q-10 6-20.5.5T440-555v-245H240v640Zm200-120-49-66q-6-8-16-8t-16 8l-55 74q-8 10-2 21t18 11h320q12 0 18-11t-2-21l-95-127q-6-8-16-8t-16 8l-89 119ZM240-160v-640 640Zm200-395q0 12 10.5 17.5t20.5-.5l49-30q10-6 20.5-6t20.5 6l49 30q10 6 20 .5t10-17.5q0 12-10 17.5t-20-.5l-49-30q-10-6-20.5-6t-20.5 6l-49 30q-10 6-20.5.5T440-555Z"} /></Icon>;
}
