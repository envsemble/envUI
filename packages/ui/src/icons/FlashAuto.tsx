// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m679-612-25 73q-3 8-10.5 13.5T627-520q-15 0-23.5-12.5T600-559l108-289q5-14 17.5-22t26.5-8q15 0 27.5 9.5T797-845l109 287q5 14-3 26t-23 12q-9 0-17-5.5T852-540l-25-72H679Zm18-52h110l-53-150h-2l-55 150ZM2";

export function IconFlashAuto({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "21-147q-9-3-15-10.5t-6-18.5v-224h-40q-33 0-56.5-23.5T80-480v-320q0-33 23.5-56.5T160-880h234q32 0 51.5 25t11.5 55l-57 200h45q36 0 53.5 32t-3.5 62L255-159q-6 9-15.5 12t-18.5 0Z" : start + "80-336l128-184H294l80-280H160v320h120v144Zm-59 189q-9-3-15-10.5t-6-18.5v-224h-40q-33 0-56.5-23.5T80-480v-320q0-33 23.5-56.5T160-880h234q32 0 51.5 25t11.5 55l-57 200h45q36 0 53.5 32t-3.5 62L255-159q-6 9-15.5 12t-18.5 0Zm59-333H160h120Z"} /></Icon>;
}
