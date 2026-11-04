// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconCounter4({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "40-360v120q0 17 11.5 28.5T560-280q17 0 28.5-11.5T600-320v-320q0-17-11.5-28.5T560-680q-17 0-28.5 11.5T520-640v120h-80v-120q0-17-11.5-28.5T400-680q-17 0-28.5 11.5T360-640v160q0 17 11.5 28.5T400-440h120Z" : start + "0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm40 40v120q0 17 11.5 28.5T560-280q17 0 28.5-11.5T600-320v-320q0-17-11.5-28.5T560-680q-17 0-28.5 11.5T520-640v120h-80v-120q0-17-11.5-28.5T400-680q-17 0-28.5 11.5T360-640v160q0 17 11.5 28.5T400-440h120Z"} /></Icon>;
}
