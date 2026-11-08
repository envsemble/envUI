// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M440-320v-320q0-17 11.5-28.5T480-680h320q17 0 28.5 11.5T840-640v320q0 17-11.5 28.5T800-280H480q-17 0-28.5-11.5T440-320Zm";

export function IconFormatImageInlineRight({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-280 40q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360h160q17 0 28.5 11.5T360-320q0 17-11.5 28.5T320-280H160Zm0 160q-17 0-28.5-11.5T120-160q0-17 11.5-28.5T160-200h640q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120H160Zm0-640q-17 0-28.5-11.5T120-800q0-17 11.5-28.5T160-840h640q17 0 28.5 11.5T840-800q0 17-11.5 28.5T800-760H160Z" : start + "80-40h240v-240H520v240Zm-360 80q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360h160q17 0 28.5 11.5T360-320q0 17-11.5 28.5T320-280H160Zm480-200ZM160-120q-17 0-28.5-11.5T120-160q0-17 11.5-28.5T160-200h640q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120H160Zm0-640q-17 0-28.5-11.5T120-800q0-17 11.5-28.5T160-840h640q17 0 28.5 11.5T840-800q0 17-11.5 28.5T800-760H160Z"} /></Icon>;
}
