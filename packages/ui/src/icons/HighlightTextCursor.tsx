// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconHighlightTextCursor({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-80-200h160q17 0 28.5-11.5T600-320q0-17-11.5-28.5T560-360h-40v-240h40q17 0 28.5-11.5T600-640q0-17-11.5-28.5T560-680H400q-17 0-28.5 11.5T360-640q0 17 11.5 28.5T400-600h40v240h-40q-17 0-28.5 11.5T360-320q0 17 11.5 28.5T400-280Z" : start + "0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm-80 200h160q17 0 28.5-11.5T600-320q0-17-11.5-28.5T560-360h-40v-240h40q17 0 28.5-11.5T600-640q0-17-11.5-28.5T560-680H400q-17 0-28.5 11.5T360-640q0 17 11.5 28.5T400-600h40v240h-40q-17 0-28.5 11.5T360-320q0 17 11.5 28.5T400-280Z"} /></Icon>;
}
