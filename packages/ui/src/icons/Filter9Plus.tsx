// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-400q33 0 56.5-23.5T560-480v-160q0-33-23.5-56.5T480-720h-40q-33 0-56.5 23.5T360-640v40q0 33 23.5 56.5T440-520h40v40h-40q-17 0-28.5 11.5T400-440q0 17 11.5 28.5T440-400h40Zm0-200h-40v-40h40v40Zm320-200ZM660-520v40q0 17 11.5 28.5T700-440q17 0 28.5-11.5T740-480v-40h";

export function IconFilter9Plus({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "40q17 0 28.5-11.5T820-560q0-17-11.5-28.5T780-600h-40v-40q0-17-11.5-28.5T700-680q-17 0-28.5 11.5T660-640v40h-40q-17 0-28.5 11.5T580-560q0 17 11.5 28.5T620-520h40ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320ZM160-80q-33 0-56.5-23.5T80-160v-520q0-17 11.5-28.5T120-720q17 0 28.5 11.5T160-680v520h520q17 0 28.5 11.5T720-120q0 17-11.5 28.5T680-80H160Z" : start + "60v-80h-60v-40q0-17-11.5-28.5T700-680q-17 0-28.5 11.5T660-640v40h-40q-17 0-28.5 11.5T580-560q0 17 11.5 28.5T620-520h40ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-520q0-17 11.5-28.5T120-720q17 0 28.5 11.5T160-680v520h520q17 0 28.5 11.5T720-120q0 17-11.5 28.5T680-80H160Zm160-720v480-480Z"} /></Icon>;
}
