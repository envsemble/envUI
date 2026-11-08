// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M160-120q-17 0-28.5-11.5T120-160v-160q0-17 11.5-28.5T160-360q17 0 28.5 11.5T200-320v160q0 17-11.5 28.5T160-120Zm1";

export function IconWallLamp({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "20-80q-17 0-28.5-11.5T240-240q0-17 11.5-28.5T280-280h160q17 0 28.5-11.5T480-320v-120H280q-20 0-32-15.5t-6-35.5l96-320q4-13 14-21t24-8h288q14 0 24 8t14 21l96 320q6 20-6 35.5T760-440H560v120q0 50-35 85t-85 35H280Z" : start + "74-400h372l-72-240H406l-72 240Zm0 0h372-372Zm-54 320q-17 0-28.5-11.5T240-240q0-17 11.5-28.5T280-280h160q17 0 28.5-11.5T480-320v-120H280q-20 0-32-15.5t-6-35.5l96-320q4-13 14-21t24-8h288q14 0 24 8t14 21l96 320q6 20-6 35.5T760-440H560v120q0 50-35 85t-85 35H280Z"} /></Icon>;
}
