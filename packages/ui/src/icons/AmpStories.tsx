// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M320-160q-17 0-28.5-11.5T280-200v-560q0-17 11.5-28.5T320-800h320q17 0 28.5 11.5T680-760v560q0 17-11.5 28.5T640-160H320ZM120-280v-401q0-17 11.5-28t28.5-11q17 0 28.5 11.5T200-680v401q0 17-11.5 28T160-240q-17 0-28.5-11.5T120-280Zm640 0v-401q0-17 11.5-28t28.5-11q17 0 28.5 11.5T840-680v401q0 17-11.5 28T800-240q-17 0-28.5-11.5T760-280Z";

export function IconAmpStories({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m-400 40h240v-480H360v480Zm0 0v-480 480Z"} /></Icon>;
}
