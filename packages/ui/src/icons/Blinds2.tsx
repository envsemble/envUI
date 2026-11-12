// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-480h-40q-17 0-28.5-11.5T80-680v-80q0-50 35-85t85-35h560q50 0 85 35t35 85v80q0 17-11.5 28.5T840-640h-40v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-120H240v120Zm0-200h480v-120h-80v40q0 17-11.5 28.5T600-400q-17 0-28.5-11.5T560-440v-40H240v120Zm0-200h320v-80H240v80Zm400 0h80v-80h-80v80Z";

export function IconBlinds2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "M160-720h640v-40q0-17-11.5-28.5T760-800H200q-17 0-28.5 11.5T160-760v40Zm640 0H160h640Z"} /></Icon>;
}
