// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M551-800H320q-17 0-28.5-11.5T280-840q0-17 11.5-28.5T320-880h311l-80 80ZM391-640H200q-17 0-28.5-11.5T160-680q0-17 11.5-28.5T200-720h271l-80 80ZM231-480H80q-17 0-28.5-11.5T40-520q0-17 11.5-28.5T80-560h231l-80 80Zm";

export function IconInkHighlighterMove({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "193-80 216 216-200 200q-24 24-56 24t-56-24l-2-2-14 14q-6 6-13.5 9t-15.5 3H148q-14 0-19-12t5-22l92-92-2-2q-24-24-24-56t24-56l200-200Zm57-57 199-199q24-24 56-24t56 24l104 104q24 24 24 56t-24 56L697-401 481-617Z" : start + "353 80L480-504 280-304l104 104 200-200Zm-47-161 104 104 199-199-104-104-199 199Zm-84-28 216 216-229 229q-24 24-56 24t-56-24l-2-2-14 14q-6 6-13.5 9t-15.5 3H148q-14 0-19-12t5-22l92-92-2-2q-24-24-24-56t24-56l229-229Zm0 0 227-227q24-24 56-24t56 24l104 104q24 24 24 56t-24 56L669-373 453-589Z"} /></Icon>;
}
