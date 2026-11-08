// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M267-200q-48 0-71-41.5t3-81.5l101-157-101-157q-26-40-3-81.5t71-41.5h333q20 0 37.5 9t28.5 25l141 200q15 21 15 46t-15 46L666-234q-11 16-28.5 25t-37.5 9H267Z";

export function IconLabelImportant({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m333-80 142-200-142-200H266l102 156q13 20 13 44t-13 44L266-280h334Zm-96-200Z"} /></Icon>;
}
