// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M660-200h-62q-12 0-17.5-10.5T582-231l100-143q5-6 11.5-4t6.5 10v88h62q12 0 17.5 10.5T778-249L678-106q-5 6-11.5 4t-6.5-10v-88Z";

export function BatteryChargingFull({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M320-80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-40q0-17 11.5-28.5T440-880h80q17 0 28.5 11.5T560-840v40h80q17 0 28.5 11.5T680-760v253q0 11-8 19t-19 10q-42 5-78 22.5T511-410q-32 32-51.5 75.5T440-240q0 30 7 58t21 54q8 17 0 32.5T443-80H320Z" : start + "m-300 40Zm-40 80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-40q0-17 11.5-28.5T440-880h80q17 0 28.5 11.5T560-840v40h80q17 0 28.5 11.5T680-760v240q0 17-11.5 28.5T640-480q-17 0-28.5-11.5T600-520v-200H360v560h101q17 0 28.5 11.5T501-120q0 17-11.5 28.5T461-80H320Z"} /></Icon>;
}
