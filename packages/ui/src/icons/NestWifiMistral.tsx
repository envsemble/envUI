// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconNestWifiMistral({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}>{filled ? <path d="M9 21q-1.95 0-3.487-1.113Q3.975 18.775 3.35 17h17.3q-.625 1.75-2.162 2.875Q16.95 21 15 21Zm-6-6V9q0-2.5 1.75-4.25T9 3h6q2.5 0 4.25 1.75T21 9v6Z" /> : <path d="M9 21q-2.5 0-4.25-1.75T3 15V9q0-2.5 1.75-4.25T9 3h6q2.5 0 4.25 1.75T21 9v6q0 2.5-1.75 4.25T15 21Zm-4-6h14V9q0-1.65-1.175-2.825Q16.65 5 15 5H9Q7.35 5 6.175 6.175 5 7.35 5 9Zm.55 2q.525.9 1.425 1.45.9.55 2.025.55h6q1.125 0 2.025-.55.9-.55 1.425-1.45ZM12 15Z" />}</Icon>;
}
