// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M305-120q-23 0-32.5-21.5T280-180l20-20H160q-17 0-28.5-11.5T120-240q0-17 11.5-28.5T160-280v-440q-17 0-28.5-11.5T120-760q0-17 11.5-28.5T160-800h120v-40q0-17 11.5-28.5T320-880h320q17 0 28.5 11.5T680-840v40h120q17 0 28.5 11.5T840-760q0 17-11.5 28.5T800-720v440q17 0 28.5 11.5T840-240q0 17-11.5 28.5T800-200H660l20 20q17 17 8 38.5T655-120q-7 0-13.5-2.5T630-130l-70-70H400l-70 70q-5 5-11.5 7.5T305-120Zm";

export function IconTrolleyCableCar({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "215-440h200v-120H520v120Zm-280 0h200v-120H240v120Zm240 240q25 0 42.5-17.5T540-380q0-25-17.5-42.5T480-440q-25 0-42.5 17.5T420-380q0 25 17.5 42.5T480-320Z" : start + "-65-160h480v-200H240v200Zm280-280h200v-120H520v120Zm-280 0h200v-120H240v120Zm240 240q25 0 42.5-17.5T540-380q0-25-17.5-42.5T480-440q-25 0-42.5 17.5T420-380q0 25 17.5 42.5T480-320ZM240-480h480-480Z"} /></Icon>;
}
