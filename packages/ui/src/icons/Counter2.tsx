// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconCounter2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "80-200q17 0 28.5-11.5T600-320q0-17-11.5-28.5T560-360H440v-80h80q33 0 56.5-23.5T600-520v-80q0-33-23.5-56.5T520-680H400q-17 0-28.5 11.5T360-640q0 17 11.5 28.5T400-600h120v80h-80q-33 0-56.5 23.5T360-440v120q0 17 11.5 28.5T400-280h160Z" : start + "0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm80 200q17 0 28.5-11.5T600-320q0-17-11.5-28.5T560-360H440v-80h80q33 0 56.5-23.5T600-520v-80q0-33-23.5-56.5T520-680H400q-17 0-28.5 11.5T360-640q0 17 11.5 28.5T400-600h120v80h-80q-33 0-56.5 23.5T360-440v120q0 17 11.5 28.5T400-280h160Z"} /></Icon>;
}
