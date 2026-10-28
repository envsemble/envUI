// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm";

export function MobileArrowRight({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "206-400-35 36q-11 11-11 27.5t12 28.5q11 11 28 11t28-11l104-104q6-6 8.5-13t2.5-15q0-8-2.5-15t-8.5-13L508-612q-11-11-27.5-11.5T452-612q-11 11-11.5 27.5T451-556l35 36H360q-17 0-28.5 11.5T320-480q0 17 11.5 28.5T360-440h126Z" : start + "0-80h400v-720H280v720Zm0 0v-720 720Zm206-320-35 36q-11 11-11 27.5t12 28.5q11 11 28 11t28-11l104-104q6-6 8.5-13t2.5-15q0-8-2.5-15t-8.5-13L508-612q-11-11-27.5-11.5T452-612q-11 11-11.5 27.5T451-556l35 36H360q-17 0-28.5 11.5T320-480q0 17 11.5 28.5T360-440h126Z"} /></Icon>;
}
