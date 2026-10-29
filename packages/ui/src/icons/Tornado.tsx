// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconTornado({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="m110-720 46 80h648l46-80q23-40 .5-80T781-840H179q-47 0-69.5 40t.5 80Zm92 160 70 120h416l70-120H202Zm116 200 93 160q23 40 69 40t69-40l93-160H318Z" /> : <path d="M179-840h602q47 0 69.5 40t-.5 80L549-200q-23 40-69 40t-69-40L110-720q-23-40-.5-80t69.5-40Zm0 80 69 120h464l69-120H179Zm116 200 69 120h232l69-120H295Zm116 200 69 120 69-120H411Z" />}</Icon>;
}
