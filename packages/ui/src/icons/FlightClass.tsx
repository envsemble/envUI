// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M560-440q-33 0-56.5-23.5T480-520v-200q0-33 23.5-56.5T560-800h80q33 0 56.5 23.5T720-720v200q0 33-23.5 56.5T640-440h-80Z";

export function FlightClass({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M380-240q-27 0-48-15.5T303-297L203-629q-2-5-2.5-11t-.5-12v-108q0-17 11.5-28.5T240-800q17 0 28.5 11.5T280-760v120l100 320h300q17 0 28.5 11.5T720-280q0 17-11.5 28.5T680-240H380Zm-20 120q-17 0-28.5-11.5T320-160q0-17 11.5-28.5T360-200h320q17 0 28.5 11.5T720-160q0 17-11.5 28.5T680-120H360Z" : start + "m0-80h80v-200h-80v200ZM380-240q-27 0-48-15.5T303-297L203-629q-2-5-2.5-11t-.5-12v-108q0-17 11.5-28.5T240-800q17 0 28.5 11.5T280-760v120l100 320h300q17 0 28.5 11.5T720-280q0 17-11.5 28.5T680-240H380Zm-20 120q-17 0-28.5-11.5T320-160q0-17 11.5-28.5T360-200h320q17 0 28.5 11.5T720-160q0 17-11.5 28.5T680-120H360Zm200-600h80-80Z"} /></Icon>;
}
