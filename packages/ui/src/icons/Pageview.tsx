// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconPageview({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M460-400q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v487q0 27-24.5 37.5T812-204L612-404q14-21 21-45t7-51q0-75-52.5-127.5T460-680q-75 0-127.5 52.5T280-500q0 75 52.5 127.5T460-320q26 0 50.5-7t45.5-21l120 120q19 19 8.5 43.5T647-160H160Z" /> : <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160h-6q-26 0-47-9t-38-26L556-348q-21 14-45.5 21t-50.5 7q-75 0-127.5-52.5T280-500q0-75 52.5-127.5T460-680q75 0 127.5 52.5T640-500q0 27-7 51t-21 45l164 164h24v-480H160v480h373q20 0 30 12.5t10 27.5q0 15-10 27.5T533-160H160Zm300-240q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM160-240v-480 480Z" />}</Icon>;
}
