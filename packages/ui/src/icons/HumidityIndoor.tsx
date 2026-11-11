// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M481-300q66 0 112.5-46T640-458q0-32-12-60.5T593-569l-85-83q-12-11-28-11t-28 11l-85 83q-23 22-35 50.5T320-458q0 66 47.5 112T481-300Zm-81-160q0-15 6-28t17-24l57-56 57 56q11 11 17 24t6 28H400ZM240-160q-33 0-56.5-23.5T160-240v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-160H240Z";

export function IconHumidityIndoor({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h480v-360L480-780 240-600v360Zm240-270Z"} /></Icon>;
}
