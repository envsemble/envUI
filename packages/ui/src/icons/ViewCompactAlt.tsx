// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M340-300h80q17 0 28.5-11.5T460-340v-80q0-17-11.5-28.5T420-460h-80q-17 0-28.5 11.5T300-420v80q0 17 11.5 28.5T340-300Zm0-200h80q17 0 28.5-11.5T460-540v-80q0-17-11.5-28.5T420-660h-80q-17 0-28.5 11.5T300-620v80q0 17 11.5 28.5T340-500Zm200 200h80q17 0 28.5-11.5T660-340v-80q0-17-11.5-28.5T620-460h-80q-17 0-28.5 11.5T500-420v80q0 17 11.5 28.5T540-300Zm0-200h80q17 0 28.5-11.5T660-540v-80q0-17-11.5-28.5T620-660h-80q-17 0-28.5 11.5T500-620v80q0 17 11.5 28.5T540-500ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z";

export function ViewCompactAlt({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h640v-480H160v480Zm0 0v-480 480Z"} /></Icon>;
}
