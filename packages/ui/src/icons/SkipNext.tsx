// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M660-280v-400q0-17 11.5-28.5T700-720q17 0 28.5 11.5T740-680v400q0 17-11.5 28.5T700-240q-17 0-28.5-11.5T660-280Zm-440-35v-330q0-18 12-29t28-11q5 0 11 1t11 5l248 166q9 6 13.5 14.5T548-480q0 10-4.5 18.5T530-447L282-281q-5 4-11 5t-11 1q-16 0-28-11t-12-29Z";

export function IconSkipNext({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m80-165Zm0 90 136-90-136-90v180Z"} /></Icon>;
}
