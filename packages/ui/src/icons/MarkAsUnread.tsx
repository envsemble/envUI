// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M160-280q-33 0-56.5-23.5T80-360v-314q0-15 8.5-29.5T112-726l272-136q17-8 36-8.5t36 8.5l266 136q12 6 20.5 19t11.5 27H637L420-790 160-661v381Zm120 160q-33 0-56.5-23.5T200-200v-360q0-33 23.5-56.5T280-640h520q33 0 56.5 23.5T880-560v360q0 33-23.5 56.5T800-120H280Zm2";

export function IconMarkAsUnread({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "60-236q10 0 19.5-2t17.5-7l204-105q9-5 14-13.5t5-18.5q0-20-17-30t-35-1L540-426 332-533q-18-9-35 1t-17 30q0 10 5 18.5t14 13.5l204 105q8 5 17.5 7t19.5 2Z" : start + "23-245L280-480v280h520v-280L577-365q-17 9-37 9t-37-9Zm37-61 260-134H280l260 134Zm260-134H280h520Z"} /></Icon>;
}
