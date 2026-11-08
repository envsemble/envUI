// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconRadio({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M160-80q-33 0-56.5-23.5T80-160v-534l523-213q14-5 27.5.5T649-887q5 14-.5 27.5T629-841L332-720h468q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm160-120q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM160-520h480v-40q0-17 11.5-28.5T680-600q17 0 28.5 11.5T720-560v40h80v-120H160v120Z" /> : <path d="M160-80q-33 0-56.5-23.5T80-160v-480q0-25 13.5-45t36.5-29l473-193q14-5 27.5.5T649-887q5 14-.5 27.5T629-841L332-720h468q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-280H160v280Zm160-40q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM160-520h480v-40q0-17 11.5-28.5T680-600q17 0 28.5 11.5T720-560v40h80v-120H160v120Zm0 360v-280 280Z" />}</Icon>;
}
