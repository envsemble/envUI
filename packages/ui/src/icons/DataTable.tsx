// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconDataTable({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M120-640h720v-100q0-25-17.5-42.5T780-800H180q-25 0-42.5 17.5T120-740v100Zm0 240h720v-160H120v160Zm60 240h600q25 0 42.5-17.5T840-220v-100H120v100q0 25 17.5 42.5T180-160Zm20-520q-17 0-28.5-11.5T160-720q0-17 11.5-28.5T200-760q17 0 28.5 11.5T240-720q0 17-11.5 28.5T200-680Zm0 240q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520q17 0 28.5 11.5T240-480q0 17-11.5 28.5T200-440Zm0 240q-17 0-28.5-11.5T160-240q0-17 11.5-28.5T200-280q17 0 28.5 11.5T240-240q0 17-11.5 28.5T200-200Z" /> : <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-507h560v-133H200v133Zm0 214h560v-134H200v134Zm0 213h560v-133H200v133Zm80-454q-17 0-28.5-11.5T240-694q0-17 11.5-28.5T280-734q17 0 28.5 11.5T320-694q0 17-11.5 28.5T280-654Zm0 214q-17 0-28.5-11.5T240-480q0-17 11.5-28.5T280-520q17 0 28.5 11.5T320-480q0 17-11.5 28.5T280-440Zm0 214q-17 0-28.5-11.5T240-266q0-17 11.5-28.5T280-306q17 0 28.5 11.5T320-266q0 17-11.5 28.5T280-226Z" />}</Icon>;
}
