// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M480-80q-15 0-29.5-6T424-104L104-424q-12-12-18-26.5T80-480q0-15 6-29.5t18-26.5l320-320q12-12 26.5-18t29.5-6q15 0 29.5 6t26.5 18l320 320q12 12 18 26.5t6 29.5q0 15-6 29.5T856-424L536-104q-12 12-26.5 18T480-80Z";

export function DirectionsAlt({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m46-360-75 76q-11 11-11 27.5t12 28.5q11 11 28 11t28-11l144-144q12-12 12-28t-12-28L508-652q-11-11-27.5-11.5T452-652q-11 11-11.5 27.5T451-596l75 76H320q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440h206Z" : start + "M320-320l160 160 320-320-320-320-320 320 160 160Zm160-160Zm46 40-75 76q-11 11-11 27.5t12 28.5q11 11 28 11t28-11l144-144q12-12 12-28t-12-28L508-652q-11-11-27.5-11.5T452-652q-11 11-11.5 27.5T451-596l75 76H320q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440h206Z"} /></Icon>;
}
