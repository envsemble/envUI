// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M340-180q-125 0-212.5-87.5T40-480q0-125 87.5-212.5T340-780q125 0 212.5 87.5T640-480q0 125-87.5 212.5T340-180Zm";

export function ClockArrowUp({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "40-313v-107q0-17-11.5-28.5T340-640q-17 0-28.5 11.5T300-600v123q0 8 3 15.5t9 13.5l80 80q11 11 28 11t28-11q11-11 11-28t-11-28l-68-69Zm360-155-24 24q-11 11-28 11t-28-11q-11-11-11-28t11-28l92-92q12-12 28-12t28 12l92 92q11 12 11 28.5T899-624q-12 11-28.5 11.5T843-624l-23-23v447q0 17-11.5 28.5T780-160q-17 0-28.5-11.5T740-200v-448Z" : start + "0-80q92 0 156-64t64-156q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 92 64 156t156 64Zm40-233v-107q0-17-11.5-28.5T340-640q-17 0-28.5 11.5T300-600v123q0 8 3 15.5t9 13.5l80 80q11 11 28 11t28-11q11-11 11-28t-11-28l-68-69Zm-40 13Zm400-168-24 24q-11 11-28 11t-28-11q-11-11-11-28t11-28l92-92q12-12 28-12t28 12l92 92q11 12 11 28.5T899-624q-12 11-28.5 11.5T843-624l-23-23v447q0 17-11.5 28.5T780-160q-17 0-28.5-11.5T740-200v-448Z"} /></Icon>;
}
