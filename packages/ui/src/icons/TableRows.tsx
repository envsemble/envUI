// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconTableRows({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M160-120q-17 0-28.5-11.5T120-160v-106q0-17 11.5-28.5T160-306h640q17 0 28.5 11.5T840-266v106q0 17-11.5 28.5T800-120H160Zm0-266q-17 0-28.5-11.5T120-426v-109q0-17 11.5-28.5T160-575h640q17 0 28.5 11.5T840-535v109q0 17-11.5 28.5T800-386H160Zm0-269q-17 0-28.5-11.5T120-695v-105q0-17 11.5-28.5T160-840h640q17 0 28.5 11.5T840-800v105q0 17-11.5 28.5T800-655H160Z" /> : <path d="M760-200v-120H200v120h560Zm0-200v-160H200v160h560Zm0-240v-120H200v120h560ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z" />}</Icon>;
}
