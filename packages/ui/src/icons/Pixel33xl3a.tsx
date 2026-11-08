// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M360 336q17 0 28.5-11.5T400 296q0-17-11.5-28.5T360 256q-17 0-28.5 11.5T320 296q0 17 11.5 28.5T360 336Zm-80 680q-33 0-56.5-23.5T200 936V216q0-33 23.5-56.5T280 136h400q33 0 56.5 23.5T760 216v720q0 33-23.5 56.5T680 1016H280Z";

export function IconPixel33xl3a({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 96 960 960" {...props}><path d={filled ? start : start + "m0-80h400V216H280v720Zm0 0V216v720Z"} /></Icon>;
}
