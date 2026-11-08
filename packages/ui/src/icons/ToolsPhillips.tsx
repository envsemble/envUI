// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M320-120q-17 0-28.5-11.5T280-160q0-17 11.5-28.5T320-200h320q17 0 28.5 11.5T680-160q0 17-11.5 28.5T640-120H320Zm0-120q-17 0-28.5-11.5T280-280v-333q0-13 4-25t12-23l122-163q6-8 14-12t18-4h60q10 0 18 4t14 12l122 163q8 11 12 23t4 25v333q0 17-11.5 28.5T640-240H320Zm40-";

export function IconToolsPhillips({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "280 80-80v-120l-80 107v93Zm240 0v-93l-80-107v120l80 80Z" : start + "80h240v-87L480-527 360-407v87Zm0-200 80-80v-120l-80 107v93Zm240 0v-93l-80-107v120l80 80Zm0 200H360h240Z"} /></Icon>;
}
