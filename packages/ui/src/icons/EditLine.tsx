// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m402-120 80-80h358q17 0 28.5 11.5T880-160q0 17-11.5 28.5T840-120H402Zm";

export function IconEditLine({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "302-528 56-56-56-56-56 56 56 56ZM120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q11 12 17 26.5t6 29.5q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97q-17 0-28.5-11.5T120-160Z" : start + "-202-80h57l391-391-57-57-391 391v57Zm560-504-56-56 56 56Zm-141 85-28-29 57 57-29-28ZM120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q11 12 17 26.5t6 29.5q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97q-17 0-28.5-11.5T120-160Z"} /></Icon>;
}
