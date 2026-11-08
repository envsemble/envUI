// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M120-160q-33 0-56.5-23.5T40-240v-480q0-33 23.5-56.5T120-800h80q33 0 56.5 23.5T280-720v480q0 33-23.5 56.5T200-160h-80Zm";

export function IconTransitionSlide({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "320 0q-33 0-56.5-23.5T360-240v-480q0-33 23.5-56.5T440-800h400q33 0 56.5 23.5T920-720v480q0 33-23.5 56.5T840-160H440Z" : start + "0-79h80v-482h-80v482Zm320 79q-33 0-56.5-23.5T360-240v-480q0-33 23.5-56.5T440-800h400q33 0 56.5 23.5T920-720v480q0 33-23.5 56.5T840-160H440Zm0-79h400v-482H440v482Zm-240 0v-482 482Zm240 0v-482 482Z"} /></Icon>;
}
