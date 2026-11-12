// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconSplitSceneUp({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M240-80q-33 0-56.5-23.5T160-160v-160q0-17 11.5-28.5T200-360h560q17 0 28.5 11.5T800-320v160q0 33-23.5 56.5T720-80H240ZM120-440q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h40v-280q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v280h40q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H120Z" /> : <path d="M240-80q-33 0-56.5-23.5T160-160v-160q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v160h480v-160q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v160q0 33-23.5 56.5T720-80H240ZM120-440q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h40v-280q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v280h40q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H120Zm600 280H240h480Z" />}</Icon>;
}
