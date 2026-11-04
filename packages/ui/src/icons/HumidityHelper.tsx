// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M400-80q-133 0-226.5-92T80-396q0-63 24.5-120.5T174-618l170-167q23-23 56-23t56 23l170 167q45 44 69.5 101.5T720-396q0 132-93.5 224T400-80Zm";

export function IconHumidityHelper({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "340-480q0-75-52.5-127.5T560-740q75 0 127.5-52.5T740-920q0 75 52.5 127.5T920-740q-75 0-127.5 52.5T740-560Z" : start + "0-80q100 0 170-68.5T640-396q0-47-18-89.5T570-560L400-728 230-560q-34 32-52 74.5T160-396q0 99 70 167.5T400-160Zm340-400q0-75-52.5-127.5T560-740q75 0 127.5-52.5T740-920q0 75 52.5 127.5T920-740q-75 0-127.5 52.5T740-560ZM400-396Z"} /></Icon>;
}
