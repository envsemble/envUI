// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function SplitScene2({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M240-120q-33 0-56.5-23.5T160-200v-120q0-17 11.5-28.5T200-360h560q17 0 28.5 11.5T800-320v120q0 33-23.5 56.5T720-120H240ZM120-440q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h40v-240q0-33 23.5-56.5T240-840h480q33 0 56.5 23.5T800-760v240h40q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H120Z" /> : <path d="M240-120q-33 0-56.5-23.5T160-200v-120q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v120h480v-120q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v120q0 33-23.5 56.5T720-120H240ZM120-440q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h40v-240q0-33 23.5-56.5T240-840h480q33 0 56.5 23.5T800-760v240h40q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H120Zm120-80h480v-240H240v240Zm480 320H240h480Zm0-560H240h480Z" />}</Icon>;
}
