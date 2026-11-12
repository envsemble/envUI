// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M800-120H160q-17 0-28.5-11.5T120-160q0-17 11.5-28.5T160-200h640q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120Zm0-160H160q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360h120v-80H160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h120v-80H160q-17 0-28.5-11.5T120-640q0-17 11.5-28.5T160-680h640q17 0 28.5 11.5T840-640q0 17-11.5 28.5T800-600H680v80h120q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H680v80h120q17 0 28.5 11.5T840-320q0 17-11.5 28.5T800-280Zm";

export function IconFormatImageBack({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "0-480H160q-17 0-28.5-11.5T120-800q0-17 11.5-28.5T160-840h640q17 0 28.5 11.5T840-800q0 17-11.5 28.5T800-760Z" : start + "-440-80h240v-80H360v80Zm0-160h240v-80H360v80Zm440-240H160q-17 0-28.5-11.5T120-800q0-17 11.5-28.5T160-840h640q17 0 28.5 11.5T840-800q0 17-11.5 28.5T800-760ZM480-440Zm0-80Z"} /></Icon>;
}
