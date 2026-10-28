// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-40q-17 0-28.5-11.5T120-80v-800q0-17 11.5-28.5T160-920q17 0 28.5 11.5T200-880v40h560v-40q0-17 11.5-28.5T800-920q17 0 28.5 11.5T840-880v800q0 17-11.5 28.5T800-40q-17 0-28.5-11.5T760-80v-40H200v40q0 17-11.5 28.5T160-40Zm40-480h80v-120q0-17 11.5-28.5T320-680h160q17 0 28.5 11.5T520-640v120h240v-240H200v240Zm0 320h240v-120q0-17 11.5-28.5T480-360h160q17 0 28.5 11.5T680-320v120h80v-240H200v240Z";

export function Shelves({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m160-320h80v-80h-80v80Zm160 320h80v-80h-80v80ZM360-520h80-80Zm160 320h80-80Z"} /></Icon>;
}
