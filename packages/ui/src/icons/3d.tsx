// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M520-360h120q33 0 56.5-23.5T720-440v-80q0-33-23.5-56.5T640-600H520v240Zm60-60v-120h60q8 0 14 6t6 14v80q0 8-6 14t-14 6h-60Zm-180 60q17 0 28.5-11.5T440-400v-40q0-17-11.5-28.5T400-480q17 0 28.5-11.5T440-520v-40q0-17-11.5-28.5T400-600H290q-13 0-21.5 8.5T260-570q0 13 8.5 21.5T290-540h90v30h-50q-13 0-21.5 8.5T300-480q0 13 8.5 21.5T330-450h50v30h-90q-13 0-21.5 8.5T260-390q0 13 8.5 21.5T290-360h110ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z";

export function Icon3d({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h640v-480H160v480Zm0 0v-480 480Z"} /></Icon>;
}
