// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M120-260v-440q0-25 17.5-42.5T180-760q25 0 42.5 17.5T240-700v440q0 25-17.5 42.5T180-200q-25 0-42.5-17.5T120-260Zm220 60q-25 0-42.5-17.5T280-260v-440q0-25 17.5-42.5T340-760h280q25 0 42.5 17.5T680-700v440q0 25-17.5 42.5T620-200H340Zm380-60v-440q0-25 17.5-42.5T780-760q25 0 42.5 17.5T840-700v440q0 25-17.5 42.5T780-200q-25 0-42.5-17.5T720-260Z";

export function ViewArray({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m-360-20h240v-400H360v400Zm120-200Z"} /></Icon>;
}
