// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function IconVideoStable({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "529-119 72-269q5-16-3.5-30T733-597L322-709q-16-5-30 3.5T273-681l-72 269q-5 16 3.5 30t24.5 19l411 112q16 5 30-3.5t19-24.5Z" : start + "0-80h640v-480H160v480Zm529-39 72-269q5-16-3.5-30T733-597L322-709q-16-5-30 3.5T273-681l-72 269q-5 16 3.5 30t24.5 19l411 112q16 5 30-3.5t19-24.5Zm-67-59-333-92 51-192 333 92-51 192Zm-462 98v-480 480Z"} /></Icon>;
}
