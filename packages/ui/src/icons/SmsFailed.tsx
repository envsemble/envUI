// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M11 6v4q0 .425.288.712.287.288.712.288t.713-.288Q13 10.425 13 10V6q0-.425-.287-.713Q12.425 5 12 5t-.712.287Q11 5.575 11 6Zm1 9q.425 0 .713-.288Q13 14.425 13 14t-.287-.713Q12.425 13 12 13t-.712.287Q11 13.575 11 14t.288.712Q11.575 15 12 15ZM2 19.575V4q0-.825.588-1.413Q3.175 2 4 2h16q.825 0 1.413.587Q22 3.175 22 4v12q0 .825-.587 1.413Q20.825 18 20 18H6l-2.3 2.3q-.475.475-1.088.212Q2 20.25 2 19.575Z";

export function IconSmsFailed({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}><path d={filled ? start : start + "m2-2.4L5.175 16H20V4H4ZM4 4v13.175Z"} /></Icon>;
}
