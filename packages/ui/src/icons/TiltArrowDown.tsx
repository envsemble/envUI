// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M240-120q-33 0-56.5-23.5T160-200v-560q0-33 23.5-56.5T240-840h480q33 0 56.5 23.5T800-760v560q0 33-23.5 56.5T720-120H240Zm";

export function IconTiltArrowDown({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-353-36-36q-11-11-27.5-11T348-508q-11 11-11 28t11 28l104 104q12 12 28 12t28-12l104-104q11-11 11-27.5T612-508q-12-12-28.5-12T555-508l-35 35v-127q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600v127Z" : start + "0-80h480v-560H240v560Zm200-273-36-36q-11-11-27.5-11T348-508q-11 11-11 28t11 28l104 104q12 12 28 12t28-12l104-104q11-11 11-27.5T612-508q-12-12-28.5-12T555-508l-35 35v-127q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600v127Zm280 273H240h480Z"} /></Icon>;
}
