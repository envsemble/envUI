// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M720-240q-17 0-28.5-11.5T680-280q0-17 11.5-28.5T720-320h120q17 0 28.5 11.5T880-280q0 17-11.5 28.5T840-240H720Zm-80-200q-17 0-28.5-11.5T600-480q0-17 11.5-28.5T640-520h200q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H640Zm-80-200q-17 0-28.5-11.5T520-680q0-17 11.5-28.5T560-720h280q17 0 28.5 11.5T880-680q0 17-11.5 28.5T840-640H560ZM320-480q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM120-240q-17 0-28.5-11.5T80-280v-36q0-21 10-40t28-30q45-27 95.5-40.5T320-440q56 0 106.5 13.5T522-386q18 11 28 30t10 40v36q0 17-11.5 28.5T520-240H120Z";

export function IconPersonText({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m200-120q-41 0-80 10t-74 30h308q-35-20-74-30t-80-10Zm0-200q17 0 28.5-11.5T360-600q0-17-11.5-28.5T320-640q-17 0-28.5 11.5T280-600q0 17 11.5 28.5T320-560Zm0-40Zm0 280Z"} /></Icon>;
}
