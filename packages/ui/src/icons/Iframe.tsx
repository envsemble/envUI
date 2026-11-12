// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconIframe({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M440-360q-17 0-28.5-11.5T400-400v-120q0-17 11.5-28.5T440-560h240q17 0 28.5 11.5T720-520v120q0 17-11.5 28.5T680-360H440ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Z" /> : <path d="M460-420h200v-80H460v80Zm-20 60q-17 0-28.5-11.5T400-400v-120q0-17 11.5-28.5T440-560h240q17 0 28.5 11.5T720-520v120q0 17-11.5 28.5T680-360H440ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Z" />}</Icon>;
}
