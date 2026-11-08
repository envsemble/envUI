// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M120-320v-120H80q-17 0-28.5-11.5T40-480q0-17 11.5-28.5T80-520h40v-120q0-50 35-85t85-35h40q0-17 11.5-28.5T320-800q17 0 28.5 11.5T360-760v560q0 17-11.5 28.5T320-160q-17 0-28.5-11.5T280-200h-40q-50 0-85-35t-35-85Zm";

export function IconPlugConnect({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "720 0q0 50-35 85t-85 35h-40q0 17-11.5 28.5T640-160q-17 0-28.5-11.5T600-200v-120H480q-17 0-28.5-11.5T440-360q0-17 11.5-28.5T480-400h120v-160H480q-17 0-28.5-11.5T440-600q0-17 11.5-28.5T480-640h120v-120q0-17 11.5-28.5T640-800q17 0 28.5 11.5T680-760h40q50 0 85 35t35 85v120h40q17 0 28.5 11.5T920-480q0 17-11.5 28.5T880-440h-40v120Z" : start + "120 40h40v-400h-40q-17 0-28.5 11.5T200-640v320q0 17 11.5 28.5T240-280Zm600-40q0 50-35 85t-85 35h-40q0 17-11.5 28.5T640-160q-17 0-28.5-11.5T600-200v-120H480q-17 0-28.5-11.5T440-360q0-17 11.5-28.5T480-400h120v-160H480q-17 0-28.5-11.5T440-600q0-17 11.5-28.5T480-640h120v-120q0-17 11.5-28.5T640-800q17 0 28.5 11.5T680-760h40q50 0 85 35t35 85v120h40q17 0 28.5 11.5T920-480q0 17-11.5 28.5T880-440h-40v120Zm-160 40h40q17 0 28.5-11.5T760-320v-320q0-17-11.5-28.5T720-680h-40v400ZM280-480Zm400 0Z"} /></Icon>;
}
