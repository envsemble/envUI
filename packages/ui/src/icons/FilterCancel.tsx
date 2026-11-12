// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m721-264-57 57q-12 12-28 12t-28-12q-11-12-11-28t11-28l56-57-56-57q-11-11-11-27.5t11-28.5q12-12 28-12t28 12l57 57 57-57q12-12 28-12t28 12q11 12 11 28t-11 28l-56 57 56 57q11 11 11 27.5T834-207q-12 12-28 12t-28-12l-57-57ZM360-160q-17 0-28.5-11.5T320-200v-240L88-736q-5-5-6.5-11.5T80-760q0-15 11-27.5t29-12.5h560q18 0 29 12.5t11 27.5q0 6-1.5 12.5T712-736L480-440v240q0 17-11.5 28.5T440-160h-80Z";

export function IconFilterCancel({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m40-308 198-252H202l198 252Zm0 0Z"} /></Icon>;
}
