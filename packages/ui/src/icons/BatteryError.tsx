// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M320-80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-40q0-17 11.5-28.5T440-880h80q17 0 28.5 11.5T560-840v40h80q17 0 28.5 11.5T680-760v";

export function BatteryError({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "281q0 12-7.5 21.5T654-443q-69 27-111 87.5T501-219q0 24 4.5 46.5T519-128q7 17-2.5 32.5T490-80H320Zm420-83-56 55q-11 11-27.5 11.5T628-108q-11-11-11-28t11-28l56-56-56-56q-11-11-11-28t11-28q11-11 28-11t28 11l56 56 56-56q11-11 27.5-11.5T852-332q11 11 11 28t-11 28l-55 56 55 56q11 11 11.5 27.5T852-108q-11 11-28 11t-28-11l-56-55Z" : start + "300q0 17-11.5 28.5T640-420q-17 0-28.5-11.5T600-460v-260H360v560h140q17 0 28.5 11.5T540-120q0 17-11.5 28.5T500-80H320Zm40-80Zm380-3-56 55q-11 11-27.5 11.5T628-108q-11-11-11-28t11-28l56-56-56-56q-11-11-11-28t11-28q11-11 28-11t28 11l56 56 56-56q11-11 27.5-11.5T852-332q11 11 11 28t-11 28l-55 56 55 56q11 11 11.5 27.5T852-108q-11 11-28 11t-28-11l-56-55Z"} /></Icon>;
}
