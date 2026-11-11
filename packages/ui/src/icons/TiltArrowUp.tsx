// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M180-120q-38 0-62-29.5T102-217l124-560q6-28 28-45.5t50-17.5h352q28 0 50 17.5t28 45.5l124 560q8 38-16 67.5T780-120H180Zm";

export function IconTiltArrowUp({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "260-367v127q0 17 11.5 28.5T480-320q17 0 28.5-11.5T520-360v-127l36 36q11 11 27.5 11t28.5-12q11-11 11-28t-11-28L508-612q-12-12-28-12t-28 12L348-508q-11 11-11 27.5t11 28.5q12 12 28.5 12t28.5-12l35-35Z" : start + "0-80h600L656-760H304L180-200Zm260-287v127q0 17 11.5 28.5T480-320q17 0 28.5-11.5T520-360v-127l36 36q11 11 27.5 11t28.5-12q11-11 11-28t-11-28L508-612q-12-12-28-12t-28 12L348-508q-11 11-11 27.5t11 28.5q12 12 28.5 12t28.5-12l35-35Zm340 287H180h600Z"} /></Icon>;
}
