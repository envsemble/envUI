// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M680-200h-80q-17 0-28.5-11.5T560-240q0-17 11.5-28.5T600-280h80v-80q0-17 11.5-28.5T720-400q17 0 28.5 11.5T760-360v80h80q17 0 28.5 11.5T880-240q0 17-11.5 28.5T840-200h-80v80q0 17-11.5 28.5T720-80q-17 0-28.5-11.5T680-120v-80Zm-480 40q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h240v-40q0-17 11.5-28.5T600-880q17 0 28.5 11.5T640-840v40h40q33 0 56.5 23.5T760-720v200q0 17-11.5 28.5T720-480q-17 0-28.5-11.5T680-520v-40H200v320h240q17 0 28.5 11.5T480-200q0 17-11.5 28.5T440-160H200Z";

export function IconCalendarAddOn({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-480h480v-80H200v80Zm0 0v-80 80Z"} /></Icon>;
}
