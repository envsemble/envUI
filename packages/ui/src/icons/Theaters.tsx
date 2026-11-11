// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M240-200v40q0 17-11.5 28.5T200-120q-17 0-28.5-11.5T160-160v-640q0-17 11.5-28.5T200-840q17 0 28.5 11.5T240-800v40h80v-40q0-17 11.5-28.5T360-840h240q17 0 28.5 11.5T640-800v40h80v-40q0-17 11.5-28.5T760-840q17 0 28.5 11.5T800-800v640q0 17-11.5 28.5T760-120q-17 0-28.5-11.5T720-160v-40h-80v40q0 17-11.5 28.5T600-120H360q-17 0-28.5-11.5T320-160v-40h-80Zm0-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm400 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Z";

export function IconTheaters({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "M400-200h160v-560H400v560Zm0-560h160-160Z"} /></Icon>;
}
