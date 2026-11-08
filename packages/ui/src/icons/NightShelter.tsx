// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M240-120q-33 0-56.5-23.5T160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H240Zm";

export function IconNightShelter({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "80-180h320v40q0 8 6 14t14 6q8 0 14-6t6-14v-140q0-33-23.5-56.5T600-480H500q-17 0-28.5 11.5T460-440v100H320v-160q0-8-6-14t-14-6q-8 0-14 6t-6 14v240q0 8 6 14t14 6q8 0 14-6t6-14v-40Zm70-60q21 0 35.5-14.5T440-410q0-21-14.5-35.5T390-460q-21 0-35.5 14.5T340-410q0 21 14.5 35.5T390-360Z" : start + "0-80h480v-360L480-740 240-560v360Zm240-270ZM320-300h320v40q0 8 6 14t14 6q8 0 14-6t6-14v-140q0-33-23.5-56.5T600-480H500q-17 0-28.5 11.5T460-440v100H320v-160q0-8-6-14t-14-6q-8 0-14 6t-6 14v240q0 8 6 14t14 6q8 0 14-6t6-14v-40Zm70-60q21 0 35.5-14.5T440-410q0-21-14.5-35.5T390-460q-21 0-35.5 14.5T340-410q0 21 14.5 35.5T390-360Z"} /></Icon>;
}
