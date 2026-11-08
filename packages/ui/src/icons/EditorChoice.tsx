// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-120 345-75q-7 2-13 3t-12 1q-32 0-56-22.5T240-151v-218L136-538q-6-10-9-20.5t-3-21.5q0-11 3-21.5t9-20.5l136-220q11-18 29-28t39-10h280q21 0 39 10t29 28l136 220q6 10 9 20.5t3 21.5q0 11-3 21.5t-9 20.5L720-369v218q0 35-24 57.5T640-71q-6 0-12-1t-13-3l-135-45Z";

export function IconEditorChoice({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M340-360h280l136-220-136-220H340L204-580l136 220Zm98-170 141-142q11-12 27.5-11.5T635-672q12 12 12.5 28.5T636-615L466-445q-12 12-28 12t-28-12l-85-85q-12-12-12-28.5t12-28.5q12-12 28.5-12t28.5 12l56 57Z" : start + "m0-84 160 53v-129H320v129l160-53ZM340-360h280l136-220-136-220H340L204-580l136 220Zm98-170 141-142q11-12 27.5-11.5T635-672q12 12 12.5 28.5T636-615L466-445q-12 12-28 12t-28-12l-85-85q-12-12-12-28.5t12-28.5q12-12 28.5-12t28.5 12l56 57Zm42 250H320h320-160Z"} /></Icon>;
}
