// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ViewStream({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M200-200q-33 0-56.5-23.5T120-280v-80q0-33 23.5-56.5T200-440h560q33 0 56.5 23.5T840-360v80q0 33-23.5 56.5T760-200H200Zm0-320q-33 0-56.5-23.5T120-600v-80q0-33 23.5-56.5T200-760h560q33 0 56.5 23.5T840-680v80q0 33-23.5 56.5T760-520H200Z" /> : <path d="M760-280v-160H200v160h560Zm0-240v-160H200v160h560ZM200-200q-33 0-56.5-23.5T120-280v-400q0-33 23.5-56.5T200-760h560q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H200Z" />}</Icon>;
}
