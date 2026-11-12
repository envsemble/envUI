// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M80-160h560v40q0 17-11.5 28.5T600-80H120q-17 0-28.5-11.5T80-120v-40Zm0-80v-40q0-17 11.5-28.5T120-320h160v-40q0-17 11.5-28.5T320-400h80q17 0 28.5 11.5T440-360v40h160q17 0 28.5 11.5T640-280v40H80Zm640-84q-36-41-58-81t-22-97v-338q0-17 11.5-28.5T680-880h160q17 0 28.5 11.5T880-840v338q0 57-21.5 97.5T800-324v164h40q17 0 28.5 11.5T880-120q0 17-11.5 28.5T840-80h-80q-17 0-28.5-11.5T720-120v-204Zm0-316h80v-160h-80v160Z";

export function IconBrunchDining({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m40 242q18-21 29-48t11-56v-58h-80v58q0 29 10 56t30 48Zm0 0Z"} /></Icon>;
}
