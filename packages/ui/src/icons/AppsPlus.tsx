// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M680-640h-80q-17 0-28.5-11.5T560-680q0-17 11.5-28.5T600-720h80v-80q0-17 11.5-28.5T720-840q17 0 28.5 11.5T760-800v80h80q17 0 28.5 11.5T880-680q0 17-11.5 28.5T840-640h-80v80q0 17-11.5 28.5T720-520q-17 0-28.5-11.5T680-560v-80ZM480-160h360q17 0 28.5-11.5T880-200v-200q0-17-11.5-28.5T840-440H480q-17 0-28.5 11.5T440-400v200q0 17 11.5 28.5T480-160ZM120-520h320q17 0 28.5-11.5T480-560v-200q0-17-11.5-28.5T440-800H120q-17 0-28.5 11.5T80-760v200q0 17 11.5 28.5T120-520Zm0 360h200q17 0 28.5-11.5T360-200v-200q0-17-11.5-28.5T320-440H120q-17 0-28.5 11.5T80-400v200q0 17 11.5 28.5T120-160Z";

export function IconAppsPlus({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m400-200ZM400-600ZM280-360Zm240 120v-120h280v120H520ZM160-600v-120h240v120H160Zm0 360v-120h120v120H160Z"} /></Icon>;
}
