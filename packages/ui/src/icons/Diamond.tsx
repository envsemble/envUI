// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconDiamond({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M368-630h224L486-840h-12L368-630Zm82 474v-414H105l345 414Zm60 0 345-414H510v414Zm148-474h207l-83-166q-11-20-29.5-32T711-840H554l104 210Zm-563 0h207l104-210H249q-23 0-41.5 12T178-796L95-630Z" /> : <path d="M480-165q-17 0-33-7.5T419-194L113-560q-9-11-13.5-24T95-611q0-9 1.5-18.5T103-647l75-149q11-20 29.5-32t41.5-12h462q23 0 41.5 12t29.5 32l75 149q5 8 6.5 17.5T865-611q0 14-4.5 27T847-560L541-194q-12 14-28 21.5t-33 7.5Zm-95-475h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z" />}</Icon>;
}
