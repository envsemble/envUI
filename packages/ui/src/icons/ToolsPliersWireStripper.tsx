// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M280-40q-20-40-30-98t-10-118q0-99 22-163.5T320-520v-200l120-200h";

export function IconToolsPliersWireStripper({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "20v206q-10 5-15 14t-5 20q0 17 11.5 28.5T480-640q17 0 28.5-11.5T520-680q0-11-5-20t-15-14v-206h20l120 200v200q37 36 58.5 100.5T720-256q0 60-10 118t-30 98q-42-13-67-47.5T589-166q0-25 5.5-54t5.5-58q0-58-31.5-122T480-520q-56 56-88 120t-32 122q0 29 6 58t7 54q0 44-25.5 79T280-40Z" : start + "80l120 200v200q37 36 58.5 100.5T720-256q0 60-10 118t-30 98q-42-13-67-47.5T589-166q0-25 5.5-54t5.5-58q0-58-31.5-122T480-520q-56 56-88 120t-32 122q0 29 6 58t7 54q0 44-25.5 79T280-40Zm200-600q-17 0-28.5-11.5T440-680q0-11 5-20t15-14v-85l-60 101v98h160v-98l-60-101v85q10 5 15 14t5 20q0 17-11.5 28.5T480-640Zm20-159h-40 40Zm-40 0h40-40Z"} /></Icon>;
}
