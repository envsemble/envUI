// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M320-80q-33 0-56.5-23.5T240-160v-320h-40q-33 0-56.5-23.5T120-560v-160q0-33 23.5-56.5T200-800h";

export function IconEarbudLeft({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "240q17 0 28.5 11.5T480-760v600q0 33-23.5 56.5T400-80h-80Zm520-560q0 100-70 170t-170 70q-17 0-28.5-11.5T560-440v-400q0-17 11.5-28.5T600-880q100 0 170 70t70 170Z" : start + "360v80H200v160h80q17 0 28.5 11.5T320-520v360h80v-360q0-17 11.5-28.5T440-560h120v80h-80v320q0 33-23.5 56.5T400-80h-80Zm520-560q0 100-70 170t-170 70q-17 0-28.5-11.5T560-440v-400q0-17 11.5-28.5T600-880q100 0 170 70t70 170Zm-80 0q0-55-33-98t-87-57v310q54-14 87-57t33-98Zm-400 0Zm280 0Z"} /></Icon>;
}
