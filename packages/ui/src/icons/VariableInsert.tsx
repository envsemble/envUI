// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M160-280q-17 0-28.5-11.5T120-320v-320q0-17 11.5-28.5T160-680h640q17 0 28.5 11.5T840-640v80q0 17-11.5 28.5T800-520";

export function IconVariableInsert({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "H640q-33 0-56.5 23.5T560-440v120q0 17-11.5 28.5T520-280H160Zm560-23v83q0 17-11.5 28.5T680-180q-17 0-28.5-11.5T640-220v-180q0-17 11.5-28.5T680-440h180q17 0 28.5 11.5T900-400q0 17-11.5 28.5T860-360h-84l116 115q12 12 12 28.5T892-188q-12 12-28.5 12T835-188L720-303Z" : start + "q-17 0-28.5-11.5T760-560v-40H200v240h320q17 0 28.5 11.5T560-320q0 17-11.5 28.5T520-280H160Zm40-80v-240 240Zm520 57v83q0 17-11.5 28.5T680-180q-17 0-28.5-11.5T640-220v-180q0-17 11.5-28.5T680-440h180q17 0 28.5 11.5T900-400q0 17-11.5 28.5T860-360h-84l116 115q12 12 12 28.5T892-188q-12 12-28.5 12T835-188L720-303Z"} /></Icon>;
}
