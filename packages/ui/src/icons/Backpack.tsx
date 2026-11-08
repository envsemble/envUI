// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-480q0-56 34-98t86-56v-46q0-17 11.5-28.5T320-880h40q17 0 28.5 11.5T400-840v40h160v-40q0-17 11.5-28.5T600-880h40q17 0 28.5 11.5T680-840v46q52 14 86 56t34 98v480q0 33-23.5 56.5T720-80H240Zm";

export function IconBackpack({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "340-320v40q0 17 11.5 28.5T620-320q17 0 28.5-11.5T660-360v-80q0-17-11.5-28.5T620-480H340q-17 0-28.5 11.5T300-440q0 17 11.5 28.5T340-400h240Z" : start + "0-80h480v-480q0-33-23.5-56.5T640-720H320q-33 0-56.5 23.5T240-640v480Zm340-240v40q0 17 11.5 28.5T620-320q17 0 28.5-11.5T660-360v-80q0-17-11.5-28.5T620-480H340q-17 0-28.5 11.5T300-440q0 17 11.5 28.5T340-400h240Zm-100-40Z"} /></Icon>;
}
