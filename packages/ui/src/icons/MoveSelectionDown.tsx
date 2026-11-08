// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M320-80q-33 0-56.5-23.5T240-160v-320q0-33 23.5-56.5T320-560h320q33 0 56.5 23.5T720-480v320q0 33-23.5 56.5T640-80H320Zm3";

export function IconMoveSelectionDown({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "60-560q-17 0-28.5-11.5T640-680q0-17 11.5-28.5T680-720q17 0 28.5 11.5T720-680q0 17-11.5 28.5T680-640Zm0-160q-17 0-28.5-11.5T640-840q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840q0 17-11.5 28.5T680-800Zm-200 0q-17 0-28.5-11.5T440-840q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800Zm-200 0q-17 0-28.5-11.5T240-840q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840q0 17-11.5 28.5T280-800Zm0 160q-17 0-28.5-11.5T240-680q0-17 11.5-28.5T280-720q17 0 28.5 11.5T320-680q0 17-11.5 28.5T280-640Z" : start + "20-400H320v320h320v-320Zm40-160q-17 0-28.5-11.5T640-680q0-17 11.5-28.5T680-720q17 0 28.5 11.5T720-680q0 17-11.5 28.5T680-640Zm0-160q-17 0-28.5-11.5T640-840q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840q0 17-11.5 28.5T680-800Zm-200 0q-17 0-28.5-11.5T440-840q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800Zm-200 0q-17 0-28.5-11.5T240-840q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840q0 17-11.5 28.5T280-800Zm0 160q-17 0-28.5-11.5T240-680q0-17 11.5-28.5T280-720q17 0 28.5 11.5T320-680q0 17-11.5 28.5T280-640Zm200 320Z"} /></Icon>;
}
