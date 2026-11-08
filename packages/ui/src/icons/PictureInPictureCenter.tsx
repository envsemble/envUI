// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function IconPictureInPictureCenter({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-200h240q17 0 28.5-11.5T640-400v-160q0-17-11.5-28.5T600-600H360q-17 0-28.5 11.5T320-560v160q0 17 11.5 28.5T360-360Z" : start + "0-80h640v-480H160v480Zm200-120h240q17 0 28.5-11.5T640-400v-160q0-17-11.5-28.5T600-600H360q-17 0-28.5 11.5T320-560v160q0 17 11.5 28.5T360-360ZM160-240v-480 480Z"} /></Icon>;
}
