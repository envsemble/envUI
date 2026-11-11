// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M390-80q-14 0-24.5-7.5T351-108l-39-131q-15-16-23.5-37t-8.5-44v-320q0-24 8.5-45t23.5-37l39-130q4-13 14.5-20.5T390-880h180q14 0 24 8t14 21l38 128q16 17 25 38t9 45v320q0 24-8.5 45T647-237l-38 128q-4 13-14.5 21T570-80H390Zm";

export function IconFitnessTracker({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "10-200h160q17 0 28.5-11.5T600-320v-320q0-17-11.5-28.5T560-680H400q-17 0-28.5 11.5T360-640v320q0 17 11.5 28.5T400-280Z" : start + "29-80h121l12-40H407l12 40Zm-19-120h160q17 0 28.5-11.5T600-320v-320q0-17-11.5-28.5T560-680H400q-17 0-28.5 11.5T360-640v320q0 17 11.5 28.5T400-280Zm7-480h145l-12-40H419l-12 40Zm72 560Zm0-560Z"} /></Icon>;
}
