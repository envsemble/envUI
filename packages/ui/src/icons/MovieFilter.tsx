// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "m9.5 11-.95 2.05L6.5 14l2.05.95L9.5 17l.95-2.05L12.5 14l-2.05-.95Zm6 0-.65 1.35-1.35.65 1.35.65.65 1.35.65-1.35L17.5 13l-1.35-.65ZM4 4l2 4h3L7 4h2l2 4h3l-2-4h2l2 4h3l-2-4h3q.825 0 1.413.588Q22 5.175 22 6v12q0 .825-.587 1.413Q20.825 20 20 20H4q-.825 0-1.412-.587Q2 18.825 2 18V6q0-.825.588-1.412Q3.175 4 4 4Z";

export function IconMovieFilter({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}><path d={filled ? start : start + "m0 6v8h16v-8Zm0 0v8Z"} /></Icon>;
}
