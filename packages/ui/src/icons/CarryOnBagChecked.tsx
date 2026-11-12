// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m692-210-41-41q-6-6-15-6t-15 6q-6 6-6 15t6 15l43 43q12 12 28 12t28-12l99-99q6-6 6-15t-6-15q-6-6-15-6t-15 6l-97 97Zm";

export function IconCarryOnBagChecked({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "28 170q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm-300-80v-560h140v-120h-40q-17 0-28.5-11.5T480-840q0-17 11.5-28.5T520-880h80q17 0 28.5 11.5T640-840v291q0 19-11 34t-28 23q-32 15-58.5 37T496-406q-26 35-41 77t-15 89q0 20 3 38.5t8 36.5q5 17-4.5 31T420-120Zm-100 0q-33 0-56.5-23.5T240-200v-400q0-33 23.5-56.5T320-680h40v560h-40Z" : start + "-332 10v-400h-40v400h40Zm-40 80q-33 0-56.5-23.5T240-200v-400q0-33 23.5-56.5T320-680h240v-120h-40q-17 0-28.5-11.5T480-840q0-17 11.5-28.5T520-880h80q17 0 28.5 11.5T640-840v307q0 20-12.5 30T600-493q-15 0-27.5-10T560-533v-67H440v400h1q17 0 28.5 11.5T481-160q0 17-11.5 28.5T441-120H320Zm400-320q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440Zm-320 40Zm-40 200v-400 400Zm80 0v-400 400Z"} /></Icon>;
}
