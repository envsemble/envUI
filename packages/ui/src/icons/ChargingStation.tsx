// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ChargingStation({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M460-440h-48q-11 0-17-9.5t-1-19.5l87-173q4-7 11.5-5.5t7.5 9.5v118h48q11 0 17 9.5t1 19.5l-87 173q-4 7-11.5 5.5T460-322v-118ZM280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v720q0 33-23.5 56.5T680-40H280Zm0-200h400v-480H280v480Z" /> : <path d="M460-440h-48q-11 0-17-9.5t-1-19.5l87-173q4-7 11.5-5.5t7.5 9.5v118h48q11 0 17 9.5t1 19.5l-87 173q-4 7-11.5 5.5T460-322v-118ZM280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v720q0 33-23.5 56.5T680-40H280Zm0-120v40h400v-40H280Zm0-80h400v-480H280v480Zm0-560h400v-40H280v40Zm0 0v-40 40Zm0 640v40-40Z" />}</Icon>;
}
