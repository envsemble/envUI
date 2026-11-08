// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M222-160h516l-56-80h-42v20q0 17-11.5 28.5T600-180q-17 0-28.5-11.5T560-220v-20H278l-56 80Zm418-400h98l-56-80h-42v80Z";

export function IconBlinds2Closed({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m0 200h98l-56-80h-42v80Zm-418 0h338v-80H278l-56 80Zm0-200h338v-80H278l-56 80Zm18 480q-33 0-56.5-23.5T160-160v-480h-40q-17 0-28.5-11.5T80-680v-80q0-50 35-85t85-35h560q50 0 85 35t35 85v80q0 17-11.5 28.5T840-640h-40v480q0 33-23.5 56.5T720-80H240Z" : start + "M200-800q-17 0-28.5 11.5T160-760v40h640v-40q0-17-11.5-28.5T760-800H200Zm-40 80h640-640Zm480 360h98l-56-80h-42v80Zm-418 0h338v-80H278l-56 80Zm0-200h338v-80H278l-56 80Zm18 480q-33 0-56.5-23.5T160-160v-480h-40q-17 0-28.5-11.5T80-680v-80q0-50 35-85t85-35h560q50 0 85 35t35 85v80q0 17-11.5 28.5T840-640h-40v480q0 33-23.5 56.5T720-80H240Z"} /></Icon>;
}
