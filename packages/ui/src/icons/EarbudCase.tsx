// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconEarbudCase({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M120-480v200q0 66 47 113t113 47h400q66 0 113-47t47-113v-200H680v80q0 33-23.5 56.5T600-320H360q-33 0-56.5-23.5T280-400v-80H120Zm240 0v80h240v-80H360Zm-240-80h720v-120q0-66-47-113t-113-47H280q-66 0-113 47t-47 113v120Z" /> : <path d="M280-120q-66 0-113-47t-47-113v-400q0-66 47-113t113-47h400q66 0 113 47t47 113v400q0 66-47 113t-113 47H280Zm-80-360v200q0 33 23.5 56.5T280-200h400q33 0 56.5-23.5T760-280v-200h-80v80q0 33-23.5 56.5T600-320H360q-33 0-56.5-23.5T280-400v-80h-80Zm160 0v80h240v-80H360Zm-160-80h560v-120q0-33-23.5-56.5T680-760H280q-33 0-56.5 23.5T200-680v120Z" />}</Icon>;
}
