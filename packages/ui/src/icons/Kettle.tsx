// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M240-280v-440l-72-96q-15-20-4-42t36-22h431q37 0 63 26t26 63v31h80q33 0 56.5 23.5T880-680v200q0 33-23.5 56.5T800-400h-80v120q0 33-23.5 56.5T640-200H320q-33 0-56.5-23.5T240-280Zm";

export function IconKettle({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "480-200h80v-200h-80v200ZM540-760q-25 0-42.5 17.5T480-700v320q0 25 17.5 42.5T540-320q25 0 42.5-17.5T600-380v-320q0-25-17.5-42.5T540-760ZM160-80q-17 0-28.5-11.5T120-120q0-17 11.5-28.5T160-160h640q17 0 28.5 11.5T840-120q0 17-11.5 28.5T800-80H160Z" : start + "80 0h320v-520H280l40 52v468Zm400-200h80v-200h-80v200ZM540-760q-25 0-42.5 17.5T480-700v320q0 25 17.5 42.5T540-320q25 0 42.5-17.5T600-380v-320q0-25-17.5-42.5T540-760ZM160-80q-17 0-28.5-11.5T120-120q0-17 11.5-28.5T160-160h640q17 0 28.5 11.5T840-120q0 17-11.5 28.5T800-80H160Zm300-460Z"} /></Icon>;
}
