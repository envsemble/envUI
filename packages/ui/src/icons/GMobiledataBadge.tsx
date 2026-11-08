// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm";

export function IconGMobiledataBadge({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-160h160q33 0 56.5-23.5T640-360v-120q0-17-11.5-28.5T600-520h-80q-17 0-28.5 11.5T480-480q0 17 11.5 28.5T520-440h40v80H400v-240h240q0-33-23.5-56.5T560-680H400q-33 0-56.5 23.5T320-600v240q0 33 23.5 56.5T400-280Z" : start + "0-80h560v-560H200v560Zm0-560v560-560Zm200 480h160q33 0 56.5-23.5T640-360v-120q0-17-11.5-28.5T600-520h-80q-17 0-28.5 11.5T480-480q0 17 11.5 28.5T520-440h40v80H400v-240h240q0-33-23.5-56.5T560-680H400q-33 0-56.5 23.5T320-600v240q0 33 23.5 56.5T400-280Z"} /></Icon>;
}
