// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M400-240q-33 0-56.5-23.5T320-320v-50q-57-39-88.5-100T200-600q0-117 81.5-198.5T480-880q117 0 198.5 81.5T760-600q0 69-31.5 129.5T640-370v50q0 33-23.5 56.5T560-240H400Zm0";

export function IconLightbulb2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + " 160q-17 0-28.5-11.5T360-120q0-17 11.5-28.5T400-160h160q17 0 28.5 11.5T600-120q0 17-11.5 28.5T560-80H400Z" : start + "-80h160v-71q0-10 4.5-19t12.5-14l17-12q41-28 63.5-71.5T680-600q0-83-58.5-141.5T480-800q-83 0-141.5 58.5T280-600q0 49 22.5 92.5T366-436l17 12q8 5 12.5 14t4.5 19v71Zm0 240q-17 0-28.5-11.5T360-120q0-17 11.5-28.5T400-160h160q17 0 28.5 11.5T600-120q0 17-11.5 28.5T560-80H400Zm80-520Z"} /></Icon>;
}
