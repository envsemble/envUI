// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconTonality2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-40-680v-38q-30 5-59 13.5T326-760h114Zm0 120v-40H230q-8 9-14 19t-12 21h236Zm0 120v-40H170l-4 20-4 20h278Zm0 120v-40H162l4 20 4 20h270Zm0 120v-40H204q6 11 12 21t14 19h210Zm0 118v-38H326q26 16 55 24.5t59 13.5Z" : start + "40-718v636q121-15 200.5-106T800-480q0-121-79.5-212T520-798Zm-80 38v-38q-30 5-59 13.5T326-760h114Zm0 120v-40H230q-8 9-14 19t-12 21h236Zm0 120v-40H170l-4 20-4 20h278Zm0 120v-40H162l4 20 4 20h270Zm0 120v-40H204q6 11 12 21t14 19h210Zm0 118v-38H326q26 16 55 24.5t59 13.5Zm80-318Z"} /></Icon>;
}
