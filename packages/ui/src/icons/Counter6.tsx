// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconCounter6({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-40-200h80q33 0 56.5-23.5T600-360v-80q0-33-23.5-56.5T520-520h-80v-80h80q17 0 28.5-11.5T560-640q0-17-11.5-28.5T520-680h-80q-33 0-56.5 23.5T360-600v240q0 33 23.5 56.5T440-280Zm0-160h80v80h-80v-80Z" : start + "0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm-40 200h80q33 0 56.5-23.5T600-360v-80q0-33-23.5-56.5T520-520h-80v-80h80q17 0 28.5-11.5T560-640q0-17-11.5-28.5T520-680h-80q-33 0-56.5 23.5T360-600v240q0 33 23.5 56.5T440-280Zm0-160h80v80h-80v-80Z"} /></Icon>;
}
