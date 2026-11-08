// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M700-300v80q0 8 6 14t14 6q8 0 14-6t6-14v-80h80q8 0 14-6t6-14q0-8-6-14t-14-6h-80v-80q0-8-6-14t-14-6q-8 0-14 6t-6 14v80h-80q-8 0-14 6t-6 14q0 8 6 14t14 6h80Zm20 180q-83 0-141.5-58.5T520-320q0-83 58.5-141.5T720-520q83 0 141.5 58.5T920-320q0 83-58.5 141.5T720-120ZM160-280v-360q0-19 8.5-36t23.5-28l240-180q";

export function IconAddHome({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v21q0 12-9.5 18.5T769-596q-67-12-132.5 8.5T522-518q-54 54-73.5 126t.5 145q5 18-5 32.5T417-200H240q-33 0-56.5-23.5T160-280Z" : start + "11-8 23-12t25-4q13 0 25 4t23 12l242 182q7 5 10.5 13t3.5 17q0 17-11.5 28.5T744-632q-7 0-13-2t-11-6L480-820 240-640v360h160q17 0 28.5 11.5T440-240q0 17-11.5 28.5T400-200H240q-33 0-56.5-23.5T160-280Zm320-270Z"} /></Icon>;
}
