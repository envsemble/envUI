// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconThumbUpOff({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}>{filled ? <path d="M10 21q-.825 0-1.412-.587Q8 19.825 8 19V8.825q0-.4.163-.763.162-.362.437-.637l5.425-5.4q.375-.35.888-.425.512-.075.987.175t.687.7q.213.45.088.925L15.55 8H21q.8 0 1.4.6.6.6.6 1.4v2q0 .175-.038.375-.037.2-.112.375l-3 7.05q-.225.5-.75.85T18 21Zm-6 0q-.825 0-1.412-.587Q2 19.825 2 19v-9q0-.825.588-1.413Q3.175 8 4 8t1.412.587Q6 9.175 6 10v9q0 .825-.588 1.413Q4.825 21 4 21Z" /> : <path d="M7 21V8l6-5.95q.375-.375.887-.438.513-.062.988.188t.7.7q.225.45.1.925L14.55 8H21q.8 0 1.4.6.6.6.6 1.4v2q0 .175-.05.375t-.1.375l-3 7.05q-.225.5-.75.85T18 21ZM9 8.85V19h9l3-7v-2h-9l1.35-5.5ZM4 21q-.825 0-1.412-.587Q2 19.825 2 19v-9q0-.825.588-1.413Q3.175 8 4 8h3v2H4v9h3v2Zm5-2V8.85 19Z" />}</Icon>;
}
