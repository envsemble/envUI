// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-120q-66 0-113-47t-47-113H200q-33 0-56.5-23.5T120-360q0-140 92-241.5T440-718v-82q0-17 11.5-28.5T480-840q17 0 28.5 11.5T520-800v82q136 15 228 116.5T840-360q0 33-23.5 56.5T760-280H640q0 66-47 113t-113 47ZM200-360h560q0-116-82-198t-198-82q-116 0-198 82t-82 198Z";

export function IconLight({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m280 160q33 0 56.5-23.5T560-280H400q0 33 23.5 56.5T480-200Zm0-80Z"} /></Icon>;
}
