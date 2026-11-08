// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M440-200v-200L138-740q-8-8-13-18.5t-5-21.5q0-26 18-43t44-17h596q26 0 44 17t18 43q0 11-5 21.5T822-740L520-400v200h160q17 0 28.5 11.5T720-160q0 17-11.5 28.5T680-120H280q-17 0-28.5-11.5T240-160q0-17 11.5-28.5T280-200h160ZM298-680h364l72-80H226l72 80Z";

export function IconLocalBar({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m182 204 111-124H369l111 124Zm0 0Z"} /></Icon>;
}
