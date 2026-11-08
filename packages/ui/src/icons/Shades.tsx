// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M157-80q-17 0-27-10t-10-30v-680q-17 0-28.5-11.5T80-840q0-17 11.5-28.5T120-880h720q17 0 28.5 11.5T880-840q0 17-11.5 28.5T840-800v680q-1 20-11 30t-27 10q-77 0-144-66t-87-134H388q-20 68-87 134T157-80Zm";

export function IconShades({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "243-280h160v-440H400v440Z" : start + "43-96q54-24 87-74t33-110v-440H200v624Zm200-184h160v-440H400v440Zm360 184v-624H640v440q0 60 32 110.5t88 73.5ZM320-800H200h120Zm440 0H640h120Z"} /></Icon>;
}
