// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function IconRectangleAdd({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "280-280v80q0 17 11.5 28.5T480-320q17 0 28.5-11.5T520-360v-80h80q17 0 28.5-11.5T640-480q0-17-11.5-28.5T600-520h-80v-80q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600v80h-80q-17 0-28.5 11.5T320-480q0 17 11.5 28.5T360-440h80Z" : start + "0-80h640v-480H160v480Zm0 0v-480 480Zm280-200v80q0 17 11.5 28.5T480-320q17 0 28.5-11.5T520-360v-80h80q17 0 28.5-11.5T640-480q0-17-11.5-28.5T600-520h-80v-80q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600v80h-80q-17 0-28.5 11.5T320-480q0 17 11.5 28.5T360-440h80Z"} /></Icon>;
}
