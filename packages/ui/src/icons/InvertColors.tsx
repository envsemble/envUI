// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconInvertColors({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M480-120q-133 0-226.5-92T160-435q0-66 25-122.5T254-658l184-181q9-8 20-12.5t22-4.5q11 0 22 4.5t20 12.5l184 181q44 44 69 100.5T800-435q0 131-93.5 223T480-120Zm0-80v-568L310-600q-35 33-52.5 75T240-435q0 97 70 166t170 69Z" /> : <path d="M480-120q-133 0-226.5-92.5T160-436q0-66 25-122t69-100l184-181q9-8 20-12.5t22-4.5q11 0 22 4.5t20 12.5l184 181q44 44 69 100t25 122q0 131-93.5 223.5T480-120Zm0-80v-568L310-600q-35 33-52.5 74.5T240-436q0 97 70 166.5T480-200Z" />}</Icon>;
}
