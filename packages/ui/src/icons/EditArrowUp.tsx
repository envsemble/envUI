// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M160-240q-17 0-28.5-11.5T120-280v-90q0-16 6.5-30.5T144-426l271-271q24-24 57.5-23t56.5 25l48 50q23 23 22.5 56T576-533L306-263q-11 11-25.5 17t-30.5 6h-90Zm";

export function IconEditArrowUp({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "309-299 50-51-49-49-51 50 50 50Zm271-109-24 24q-11 11-28 11t-28-11q-11-11-11-28t11-28l92-92q12-12 28-12t28 12l92 92q11 12 11 28.5T899-624q-12 11-28.5 11.5T843-624l-23-23v447q0 17-11.5 28.5T780-160q-17 0-28.5-11.5T740-200v-448Z" : start + "40-80h50l162-162-25-25-25-25-162 162v50Zm269-219-50-50 50 50Zm271-109-24 24q-11 11-28 11t-28-11q-11-11-11-28t11-28l92-92q12-12 28-12t28 12l92 92q11 12 11 28.5T899-624q-12 11-28.5 11.5T843-624l-23-23v447q0 17-11.5 28.5T780-160q-17 0-28.5-11.5T740-200v-448Z"} /></Icon>;
}
