// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M240-360q-50 0-85-35t-35-85v-120q0-17 11.5-28.5T160-640h481q5-33 27-59t54-37l147-49q16-5 31 2t20 23q5 16-2.5 31T894-709l-147 49q-12 4-19.5 14.5T720-622v142q0 50-35 85t-85 35H240Zm";

export function SkilletCooktop({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "120 200v-80H120q-17 0-28.5-11.5T80-280q0-17 11.5-28.5T120-320h240q33 0 56.5 23.5T440-240v80q0 17-11.5 28.5T400-120q-17 0-28.5-11.5T360-160Zm160 0v-80q0-33 23.5-56.5T600-320h240q17 0 28.5 11.5T880-280q0 17-11.5 28.5T840-240H600v80q0 17-11.5 28.5T560-120q-17 0-28.5-11.5T520-160Z" : start + "0-80h360q17 0 28.5-11.5T640-480v-80H200v80q0 17 11.5 28.5T240-440Zm120 280v-80H120q-17 0-28.5-11.5T80-280q0-17 11.5-28.5T120-320h240q33 0 56.5 23.5T440-240v80q0 17-11.5 28.5T400-120q-17 0-28.5-11.5T360-160Zm160 0v-80q0-33 23.5-56.5T600-320h240q17 0 28.5 11.5T880-280q0 17-11.5 28.5T840-240H600v80q0 17-11.5 28.5T560-120q-17 0-28.5-11.5T520-160ZM420-500Z"} /></Icon>;
}
