// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconOfflineBolt({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-24-340v137q0 16 15 19.5t23-10.5l121-237q5-10-1-19.5t-17-9.5h-87v-139q0-16-15-20t-23 10L346-449q-5 11 .5 20t16.5 9h93Z" : start + "0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm-24 60v137q0 16 15 19.5t23-10.5l121-237q5-10-1-19.5t-17-9.5h-87v-139q0-16-15-20t-23 10L346-449q-5 11 .5 20t16.5 9h93Z"} /></Icon>;
}
