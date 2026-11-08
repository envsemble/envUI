// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M318-120q-22 0-40-10.5T249-160L87-440q-11-19-11-40t11-40l162-280q11-19 29-29.5t40-10.5h324q22 0 40 10.5t29 29.5l162 280q11 19 11 40t-11 40L711-160q-11 19-29 29.5T642-120H318Z";

export function IconHexagon({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h324l161-280-161-280H318L156-480l162 280Zm162-280Z"} /></Icon>;
}
