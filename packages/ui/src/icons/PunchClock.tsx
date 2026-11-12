// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M200-80q-33 0-56.5-23.5T120-160v-480q0-33 23.5-56.5T200-720h40v-120q0-33 23.5-56.5T320-920h320q33 0 56.5 23.5T720-840v120h40q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H200Zm120-640h320v-120H320v120Z";

export function IconPunchClock({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m160 500q75 0 127.5-52.5T660-400q0-75-52.5-127.5T480-580q-75 0-127.5 52.5T300-400q0 75 52.5 127.5T480-220Zm20-188v-72q0-8-6-14t-14-6q-8 0-14 6t-6 14v71q0 8 3 15.5t9 13.5l40 40q6 6 14 6t14-6q6-6 6-14t-6-14l-40-40Z" : start + "M200-160h560v-480H200v480Zm280-40q83 0 141.5-58.5T680-400q0-83-58.5-141.5T480-600q-83 0-141.5 58.5T280-400q0 83 58.5 141.5T480-200Zm0-60q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm20-148v-72q0-8-6-14t-14-6q-8 0-14 6t-6 14v71q0 8 3 15.5t9 13.5l40 40q6 6 14 6t14-6q6-6 6-14t-6-14l-40-40Zm-20 8Z"} /></Icon>;
}
