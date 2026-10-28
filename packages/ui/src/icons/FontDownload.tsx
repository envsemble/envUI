// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M384-362h192l35 97q4 11 14 18t22 7q20 0 32.5-16.5T684-293L532-695q-5-11-15-18t-22-7h-30q-12 0-22 7t-15 18L276-293q-8 19 4 36t32 17q13 0 22.5-7t14.5-19l35-96Zm24-70 70-198h4l70 198H408ZM160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v640q0 33-23.5 56.5T800-80H160Z";

export function FontDownload({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h640v-640H160v640Zm0-640v640-640Z"} /></Icon>;
}
