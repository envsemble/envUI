// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function Capture({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm120-160h400q17 0 28.5-11.5T720-360v-240q0-17-11.5-28.5T680-640H280q-17 0-28.5 11.5T240-600v240q0 17 11.5 28.5T280-320Z" /> : <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm120-80h400q17 0 28.5-11.5T720-360v-240q0-17-11.5-28.5T680-640H280q-17 0-28.5 11.5T240-600v240q0 17 11.5 28.5T280-320Zm-120 80v-480 480Z" />}</Icon>;
}
