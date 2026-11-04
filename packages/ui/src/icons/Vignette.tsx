// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function IconVignette({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "320-160q98 0 169-47.5T720-480q0-65-71-112.5T480-640q-98 0-169 47.5T240-480q0 65 71 112.5T480-320Z" : start + "0-80h640v-480H160v480Zm0 0v-480 480Zm320-80q98 0 169-47.5T720-480q0-65-71-112.5T480-640q-98 0-169 47.5T240-480q0 65 71 112.5T480-320Zm0-80q-65 0-112.5-24T320-480q0-32 47.5-56T480-560q65 0 112.5 24t47.5 56q0 32-47.5 56T480-400Z"} /></Icon>;
}
