// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M440-200H160q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h280v-40q0-17 11.5-28.5T480-840q17 0 28.5 11.5T520-800v40h280q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200H520v40q0 17-11.5 28.5T480-120q-17 0-28.5-11.5T440-160v-40Zm0-80v-80H160v80h280ZM160-600h280v-80H160v80Zm";

export function IconBulletChart({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "360 320h280v-400H520v80h40q33 0 56.5 23.5T640-520v80q0 33-23.5 56.5T560-360h-40v80Z" : start + "0 160h400v-80H160v80Zm360 160h280v-400H520v80h40q33 0 56.5 23.5T640-520v80q0 33-23.5 56.5T560-360h-40v80ZM160-440v-80 80Z"} /></Icon>;
}
