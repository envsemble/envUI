// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M240-160q-50 0-85-35t-35-85v-320q0-17 11.5-28.5T160-640h640q17 0 28.5 11.5T840-600v320q0 50-35 85t-85 35H240Zm";

export function IconStockpot({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "120-600v-40q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800v40h200q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H160q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h200Z" : start + "-40-400v280q0 17 11.5 28.5T240-240h480q17 0 28.5-11.5T760-280v-280H200Zm160-200v-40q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800v40h200q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H160q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h200Zm120 360Z"} /></Icon>;
}
