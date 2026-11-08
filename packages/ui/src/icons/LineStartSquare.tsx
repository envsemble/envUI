// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconLineStartSquare({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M120-260q-17 0-28.5-11.5T80-300v-360q0-17 11.5-28.5T120-700h360q17 0 28.5 11.5T520-660v140h320q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H520v140q0 17-11.5 28.5T480-260H120Z" /> : <path d="M160-340h280v-280H160v280Zm-40 80q-17 0-28.5-11.5T80-300v-360q0-17 11.5-28.5T120-700h360q17 0 28.5 11.5T520-660v140h320q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H520v140q0 17-11.5 28.5T480-260H120Zm180-220Z" />}</Icon>;
}
