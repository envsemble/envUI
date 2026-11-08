// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconLineStartCircle({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M320-240q-100 0-170-70T80-480q0-100 70-170t170-70q90 0 156.5 57T557-520h283q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H557q-14 86-80.5 143T320-240Z" /> : <path d="M320-320q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0 80q-100 0-170-70T80-480q0-100 70-170t170-70q90 0 156.5 57T557-520h283q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H557q-14 86-80.5 143T320-240Zm0-240Z" />}</Icon>;
}
