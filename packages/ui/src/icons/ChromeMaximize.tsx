// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M240 896q-33 0-56.5-23.5T160 816V336q0-33 23.5-56.5T240 256h480q33 0 56.5 23.5T800 336v480q0 33-23.5 56.5T720 896H240Z";

export function ChromeMaximize({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 96 960 960" {...props}><path d={filled ? start : start + "m0-80h480V336H240v480Zm0-480v480-480Z"} /></Icon>;
}
