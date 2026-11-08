// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Zm320-160q17 0 28.5-11.5T520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280Zm0-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600ZM";

export function IconMovieInfo({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "160-200h80v-80h-80v80Zm560 0h80v-80h-80v80ZM160-360h80v-80h-80v80Zm560 0h80v-80h-80v80ZM160-520h80v-80h-80v80Zm560 0h80v-80h-80v80ZM160-680h80v-80h-80v80Zm560 0h80v-80h-80v80Z" : start + "320-200h320v-560H320v560Zm0-560h320-320ZM160-200h80v-80h-80v80Zm560 0h80v-80h-80v80ZM160-360h80v-80h-80v80Zm560 0h80v-80h-80v80ZM160-520h80v-80h-80v80Zm560 0h80v-80h-80v80ZM160-680h80v-80h-80v80Zm560 0h80v-80h-80v80Z"} /></Icon>;
}
