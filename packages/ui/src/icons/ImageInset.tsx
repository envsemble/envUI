// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M280-320h400q17 0 28.5-11.5T720-360v-240q0-17-11.5-28.5T680-640H280q-17 0-28.5 11.5T240-600v240q0 17 11.5 28.5T280-320ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function ImageInset({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-240q-12 0-18-11t2-21l45-60q6-8 16-8t16 8l39 52 59-79q6-8 16-8t16 8l65 87q8 10 2 21t-18 11H360Z" : start + "0-80h640v-480H160v480Zm0 0v-480 480Zm200-160q-12 0-18-11t2-21l45-60q6-8 16-8t16 8l39 52 59-79q6-8 16-8t16 8l65 87q8 10 2 21t-18 11H360Z"} /></Icon>;
}
