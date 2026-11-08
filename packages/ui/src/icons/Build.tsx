// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M360-360q-100 0-170-70t-70-170q0-20 3-40t11-38q5-10 12.5-15t16.5-7q9-2 18.5.5T199-689l105 105 72-72-105-105q-8-8-10.5-17.5T260-797q2-9 7-16.5t15-12.5q18-8 38-11t40-3q100 0 170 70t70 170q0 23-4 43.5T584-516l202 200q29 29 29 71t-29 71q-29 29-71 29t-71-30L444-376q-20 8-40.5 12t-43.5 4Z";

export function IconBuild({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80q26 0 52-8t47-25l243 243q5 5 13.5 4.5T729-231q5-5 5-13.5t-5-13.5L486-500q18-20 26-46.5t8-53.5q0-60-38.5-104.5T386-758l74 74q12 12 12 28t-12 28L332-500q-12 12-28 12t-28-12l-74-74q9 57 53.5 95.5T360-440Zm109-51Z"} /></Icon>;
}
