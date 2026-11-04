// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M11.3 22.3 9 20H5q-.825 0-1.413-.587Q3 18.825 3 18V4q0-.825.587-1.413Q4.175 2 5 2h14q.825 0 1.413.587Q21 3.175 21 4v14q0 .825-.587 1.413Q19.825 20 19 20h-4l-2.3 2.3q-.";

export function IconAssistant({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}><path d={filled ? start + "275.275-.7.275-.425 0-.7-.275Zm2.25-9.75 2.425-1.1q.3-.125.3-.45t-.3-.45l-2.425-1.1-1.1-2.425q-.125-.3-.45-.3t-.45.3l-1.1 2.425-2.425 1.1q-.3.125-.3.45t.3.45l2.425 1.1 1.1 2.425q.125.3.45.3t.45-.3Z" : start + "3.3-.7.3-.4 0-.7-.3ZM5 18h4.8l2.2 2.2 2.2-2.2H19V4H5v14ZM5 4v14V4Zm8.55 8.55 2.425-1.1q.3-.125.3-.45t-.3-.45l-2.425-1.1-1.1-2.425q-.125-.3-.45-.3t-.45.3l-1.1 2.425-2.425 1.1q-.3.125-.3.45t.3.45l2.425 1.1 1.1 2.425q.125.3.45.3t.45-.3Z"} /></Icon>;
}
