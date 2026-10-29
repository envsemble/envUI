// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M240-160v-560q0-33 23.5-56.5T320-800h298q20 0 37 9t28 25l85 120q14 21 14 46t-14 46l-85 120q-11 16-28 25t-37 9H320v240q0 17-11.5 28.5T280-120q-17 0-28.5-11.5T240-160Z";

export function IconPersonalPlaces({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m80-320h300l80-120-80-120H320v240Zm0 0v-240 240Z"} /></Icon>;
}
