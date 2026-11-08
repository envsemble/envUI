// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M320-120q-17 0-28.5-11.5T280-160v-208l-23 37q-9 14-25 17.5t-30-5.5q-14-9-18-25t5-30l257-412q6-10 15-14t19-4q10 0 19 4t15 14l257 412q9 14 5 30t-18 25q-14 9-30 5t-25-18l-23-36v208q0 17-11.5 28.5T640-120H";

export function IconBungalow({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "520v-160q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280v160H320Zm160-280q17 0 28.5-11.5T520-440q0-17-11.5-28.5T480-480q-17 0-28.5 11.5T440-440q0 17 11.5 28.5T480-400Z" : start + "320Zm40-80h80v-80q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280v80h80v-296L480-688 360-496v296Zm0 0h240-240Zm120-200q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Z"} /></Icon>;
}
