// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconHardware({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M400-120q-17 0-28.5-11.5T360-160v-280h240v280q0 17-11.5 28.5T560-120H400Zm-40-400v-120H208q-19 0-31-14t-8-33q13-68 67.5-110.5T360-840h200q17 0 28.5 11.5T600-800v80l102-102q8-8 19.5-13t23.5-5h15q17 0 28.5 11.5T800-800v240q0 17-11.5 28.5T760-520h-15q-12 0-23.5-5T702-538L600-640v120H360Z" /> : <path d="M400-120q-17 0-28.5-11.5T360-160v-480H208q-19 0-31-14t-8-33q13-68 67.5-110.5T360-840h200q17 0 28.5 11.5T600-800v80l102-102q8-8 19.5-13t23.5-5h15q17 0 28.5 11.5T800-800v240q0 17-11.5 28.5T760-520h-15q-12 0-23.5-5T702-538L600-640v480q0 17-11.5 28.5T560-120H400Zm40-80h80v-240h-80v240Zm0-320h80v-240H360q-26 0-49 10.5T271-720h169v200Zm40 40Z" />}</Icon>;
}
