// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M284-120q-17 0-29.5-13T244-163l36-395-32-189q-5-26 12.5-59.5T338-840q59 0 103.5 38t54.5 96l18 106h166q17 0 28.5 11.5T720-560q0 17-11.5 28.5T680-520h-36l32 357q2 17-10 30t-30 13q-16 0-26.5-10.5T597-156l-4-44H327l-4 44q-2 15-12.5 25.5T284-120Zm5";

export function IconHighChair({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "0-160h251l-7-80H342l-8 80Zm15-160h222l-8-80H356l-7 80Z" : start + "4-480h95l-16-93q-5-29-27.5-48T338-760h-11l11 160Zm0 0h95-95Zm-4 320h251l-7-80H342l-8 80Zm15-160h222l-8-80H356l-7 80Z"} /></Icon>;
}
