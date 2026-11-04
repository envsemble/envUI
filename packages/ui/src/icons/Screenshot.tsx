// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M580-340v-70q0-13 8.5-21.5T610-440q13 0 21.5 8.5T640-410v90q0 17-11.5 28.5T600-280h-90q-13 0-21.5-8.5T480-310q0-13 8.5-21.5T510-340h70ZM380-620v70q0 13-8.5 21.5T350-520q-13 0-21.5-8.5T320-550v-90q0-17 11.5-28.5T360-680h90q13 0 21.5 8.5T480-650q0 13-8.5 21.5T450-620h-70ZM280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v720q0 33-23.5 56.5T680-40H280Zm0-";

export function IconScreenshot({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200h400v-480H280v480Z" : start + "120v40h400v-40H280Zm0-80h400v-480H280v480Zm0-560h400v-40H280v40Zm0 0v-40 40Zm0 640v40-40Z"} /></Icon>;
}
