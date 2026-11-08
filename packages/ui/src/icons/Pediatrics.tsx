// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M320-680q-17 0-28.5-11.5T280-720q0-17 11.5-28.5T320-760h120v-80q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840v80h120q17 0 28.5 11.5T680-720q0 17-11.5 28.5T640-680H320Zm40 600q-33 0-56.5-23.5T280-160v-";

export function IconPediatrics({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "80h160q17 0 28.5-11.5T480-280q0-17-11.5-28.5T440-320H280v-80h160q17 0 28.5-11.5T480-440q0-17-11.5-28.5T440-480H280v-40q0-50 35-85t85-35h160q50 0 85 35t35 85v360q0 33-23.5 56.5T600-80H360Z" : start + "360q0-50 35-85t85-35h160q50 0 85 35t35 85v360q0 33-23.5 56.5T600-80H360Zm0-80h240v-360q0-17-11.5-28.5T560-560H400q-17 0-28.5 11.5T360-520v40h80q17 0 28.5 11.5T480-440q0 17-11.5 28.5T440-400h-80v80h80q17 0 28.5 11.5T480-280q0 17-11.5 28.5T440-240h-80v80Zm0 0v-400 400Z"} /></Icon>;
}
