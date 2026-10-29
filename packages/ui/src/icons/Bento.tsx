// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconBento({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M640-520v-240h160q33 0 56.5 23.5T880-680v160H640ZM160-200q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h400v560H160Zm160-220q25 0 42.5-17.5T380-480q0-25-17.5-42.5T320-540q-25 0-42.5 17.5T260-480q0 25 17.5 42.5T320-420Zm320 220v-240h240v160q0 33-23.5 56.5T800-200H640Z" /> : <path d="M160-200q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h640q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200H160Zm400-320h240v-160H560v160ZM160-280h320v-400H160v400Zm160-140q-25 0-42.5-17.5T260-480q0-25 17.5-42.5T320-540q25 0 42.5 17.5T380-480q0 25-17.5 42.5T320-420Zm240 140h240v-160H560v160Z" />}</Icon>;
}
