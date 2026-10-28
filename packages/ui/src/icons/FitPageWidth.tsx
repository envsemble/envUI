// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function FitPageWidth({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-248v-144q0-14-12-19t-22 5l-58 58q-12 12-12 28t12 28l58 58q10 10 22 5t12-19Zm332-100-58-58q-10-10-22-5t-12 19v144q0 14 12 19t22-5l58-58q12-12 12-28t-12-28Z" : start + "640-560H160v480h640v-480Zm-640 0v480-480Zm200 312v-144q0-14-12-19t-22 5l-58 58q-12 12-12 28t12 28l58 58q10 10 22 5t12-19Zm332-100-58-58q-10-10-22-5t-12 19v144q0 14 12 19t22-5l58-58q12-12 12-28t-12-28Z"} /></Icon>;
}
