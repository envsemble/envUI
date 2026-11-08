// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M414-360q-35 0-55.5-22T330-440h300q-8 36-28.5 58T546-360H414Zm-51-160q7-18 22-29t35-11h53q27-27 37.5-33.5T540-600q25 0 42.5 17.5T600-540v20H363Zm51 240h132q91 0 131.5-68.5T720-520h-40v-20q0-58-41-99t-99-41q-29 0-54.5 10.5T440-640h-20q-52 0-91 34.5T282-520h-42q2 103 42.5 171.5T414-280ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h40v-40q0-17 11.5-28.5T280-920q17 0 28.5 11.5T320-880v40h320v-40q0-17 11.5-28.5T680-920q17 0 28.5 11.5T720-880v40h40q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z";

export function IconCalendarMeal2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m560-80v-560H200v560h560Zm-560 0v-560 560Z"} /></Icon>;
}
