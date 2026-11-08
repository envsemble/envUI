// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m542-461 128-86q18-12 18-33t-18-33l-128-86q-20-14-41-2t-21 36v170q0 24 21 36t41-2ZM361-280q-33 0-56.5-23.5T281-360v-440q0-33 23.5-56.5T361-880h440q33 0 56.5 23.5T881-800v440q0 33-23.5 56.5T801-280H361Z";

export function IconAnimatedImages({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M229-85q-33 5-59-16t-30-54L86-592q-4-33 16.5-59t53.5-30l45-5v366q0 50 35 85t85 35h411q-6 24-24 41.5T664-138L229-85Z" : start + "m0-80h440v-440H361v440Zm220-220ZM228-85q-33 4-59.5-16T138-154L86-592q-4-33 16.5-58.5T156-681h2q17-3 30.5 9t13.5 30q0 15-10.5 26T166-602h-1l54 438 474-58q17-2 30 8t15 27q2 17-8 29.5T703-143L228-85Zm-9-79Z"} /></Icon>;
}
