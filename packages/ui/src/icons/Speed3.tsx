// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M513-328q30-14 44.5-48t-6.5-64q-44-63-88.5-122.5T372-682q-11-14-27.5-6.5T332-663q16 73 34 145t40 146q10 35 41.5 46.5T513-328ZM205-160q-2";

export function IconSpeed3({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "2 0-40.5-9.5T135-198q-28-48-42-100.5T79-406q1-80 34-151.5T201-683q55-54 127-85.5T480-800q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-400q0 54-14 105t-40 97q-11 19-30 28.5t-40 9.5H205Z" : start + "1 0-40.5-9.5T135-198q-28-46-41-97.5T81-400q0-69 23.5-138.5T179-663q15-17 32-16.5t28 10.5q11 10 14 25t-9 29q-38 42-60.5 99T161-400q0 41 10.5 81.5T205-240h551q21-36 32.5-77t11.5-83q0-75-32.5-139T681-648q-42-35-95-54t-108-18q-16 0-28.5-10.5T435-757q-2-16 6-29t24-14q73-3 142.5 21T734-708q67 56 106.5 135T880-400q0 56-14 106.5T826-198q-11 19-30 28.5t-40 9.5H205Zm276-241Z"} /></Icon>;
}
