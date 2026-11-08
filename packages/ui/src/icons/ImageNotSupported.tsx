// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconImageNotSupported({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}>{filled ? <path d="m19.775 22.6-1.6-1.6H5q-.825 0-1.413-.587Q3 19.825 3 19V5.8L1.4 4.2q-.275-.275-.275-.7 0-.425.275-.7.275-.275.7-.275.425 0 .7.275l18.4 18.4q.3.3.288.7-.013.4-.313.7-.3.275-.7.287-.4.013-.7-.287ZM7 17h7.175l-2.325-2.325-.85 1.05-1.6-2.175q-.15-.2-.4-.2t-.4.2l-2 2.65q-.2.25-.05.525Q6.7 17 7 17Zm14 1.175L5.825 3H19q.825 0 1.413.587Q21 4.175 21 5Z" /> : <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5.825L1.4 4.2q-.275-.275-.287-.688Q1.1 3.1 1.4 2.8q.275-.275.7-.275.425 0 .7.275l18.4 18.4q.3.3.288.7-.013.4-.313.7-.3.275-.7.287-.4.013-.7-.287l-1.6-1.6Zm0-2h11.175l-2-2H7q-.3 0-.45-.275-.15-.275.05-.525l2-2.65q.15-.2.4-.2t.4.2l1.6 2.175.85-1.05L5 7.825V19Zm16-.825-2-2V5H7.825l-2-2H19q.825 0 1.413.587Q21 4.175 21 5Zm-7.525-7.525ZM10.6 13.425Z" />}</Icon>;
}
