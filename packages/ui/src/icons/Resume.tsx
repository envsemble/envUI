// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M240-280v-400q0-17 11.5-28.5T280-720q17 0 28.5 11.5T320-680v400q0 17-11.5 28.5T280-240q-17 0-28.5-11.5T240-280Zm221 4";

export function IconResume({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "q-20 12-40.5 0T400-311v-338q0-23 20.5-35t40.5 0l282 170q20 12 20 34t-20 34L461-276Z" : start + " 282-170q10-6 14.5-15t4.5-19q0-10-4.5-19T743-514L461-684q-5-3-10.5-4t-10.5-1q-16 0-28 11.5T400-649v338q0 17 12 28.5t28 11.5q5 0 10.5-1t10.5-4Zm19-105v-198l165 99-165 99Zm0-99Z"} /></Icon>;
}
