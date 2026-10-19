// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ArrowShapeUp({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M320-160v-200H183q-19 0-27-17t4-32l289-353q12-15 31-15t31 15l289 353q12 15 4 32t-27 17H640v200q0 17-11.5 28.5T600-120H360q-17 0-28.5-11.5T320-160Z" /> : <path d="M320-160v-200H183q-19 0-27-17t4-32l289-353q12-15 31-15t31 15l289 353q12 15 4 32t-27 17H640v200q0 17-11.5 28.5T600-120H360q-17 0-28.5-11.5T320-160Zm80-40h160v-200q0-17 11.5-28.5T600-440h71L480-674 289-440h71q17 0 28.5 11.5T400-400v200Zm80-240Z" />}</Icon>;
}
