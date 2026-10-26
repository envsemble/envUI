// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ResponsiveLayout({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M680-120q-17 0-28.5-11.5T640-160v-400q0-33-23.5-56.5T560-640H420q-17 0-28.5-11.5T380-680v-120q0-17 11.5-28.5T420-840h380q17 0 28.5 11.5T840-800v640q0 17-11.5 28.5T800-120H680Zm-260 0q-17 0-28.5-11.5T380-160v-360q0-17 11.5-28.5T420-560h100q17 0 28.5 11.5T560-520v360q0 17-11.5 28.5T520-120H420Zm-260 0q-17 0-28.5-11.5T120-160v-360q0-17 11.5-28.5T160-560h100q17 0 28.5 11.5T300-520v360q0 17-11.5 28.5T260-120H160Z" /> : <path d="M120-200v-360q0-33 23.5-56.5T200-640h120v-120q0-33 23.5-56.5T400-840h360q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200Zm520 0h120v-560H400v120h160q33 0 56.5 23.5T640-560v360Zm-240 0h160v-360H400v360Zm-200 0h120v-360H200v360Z" />}</Icon>;
}
