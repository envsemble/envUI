// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-200q-66 0-113-47T0-360q0-57 36.5-101t93.5-55l-28-24H30q-13 0-21.5-8.5T0-570q0-13 8.5-21.5T30-600h150l100 60 146-55q7-2 14-3.5t15-1.5h111l-62-80h-64q-17 0-28.5-11.5T400-720q0-17 11.5-28.5T440-760h63q19 0 35.5 8.5T566-729l60 77 105-53q10-5 19.5 1t9.5 17v67q0 8-6 14t-14 6h-72l70 92q15-6 30.5-9t31.5-3q66 0 113 47t47 113q0 66-47 113t-113 47q-66 0-113-47t-47-113q0-27 9.5-52.5T676-460l-20-24-124 186q-5 8-14 13t-19 5h-84q-8 0-14.5-2.5T389-290l-69-60q-5 63-51 106.5T160-200Zm0-80q33 0 56.5-23.5T240-360q0-33-23.5-56.5T160-440q-33 0-56.5 23.5T80-360q0 33 23.5 56.5T160-280Zm";

export function TwoWheeler({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "640 0q33 0 56.5-23.5T880-360q0-33-23.5-56.5T800-440q-33 0-56.5 23.5T720-360q0 33 23.5 56.5T800-280Z" : start + "294-240-144 54 144-54h130-130Zm346 240q33 0 56.5-23.5T880-360q0-33-23.5-56.5T800-440q-33 0-56.5 23.5T720-360q0 33 23.5 56.5T800-280Zm-322-80 106-160H454l-144 54 120 106h48Z"} /></Icon>;
}
