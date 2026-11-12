// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconEarbudRight({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M480-160v-600q0-17 11.5-28.5T520-800h240q33 0 56.5 23.5T840-720v160q0 33-23.5 56.5T760-480h-40v320q0 33-23.5 56.5T640-80h-80q-33 0-56.5-23.5T480-160ZM120-640q0-100 70-170t170-70q17 0 28.5 11.5T400-840v400q0 17-11.5 28.5T360-400q-100 0-170-70t-70-170Z" /> : <path d="M480-480h-80v-80h120q17 0 28.5 11.5T560-520v360h80v-360q0-17 11.5-28.5T680-560h80v-160H400v-80h360q33 0 56.5 23.5T840-720v160q0 33-23.5 56.5T760-480h-40v320q0 33-23.5 56.5T640-80h-80q-33 0-56.5-23.5T480-160v-320ZM120-640q0-100 70-170t170-70q17 0 28.5 11.5T400-840v400q0 17-11.5 28.5T360-400q-100 0-170-70t-70-170Zm80 0q0 55 33 98t87 57v-310q-54 14-87 57t-33 98Zm400 0Zm-280 0Z" />}</Icon>;
}
