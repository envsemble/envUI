// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m440-217-191-80q-23-9-36-29.5T200-371v-69q0-33 23.5-56.5T280-520h160v-120h-40q-33 0-56.5-23.5T320-720v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80q0 33-23.5 56.5T560-640h-40v120h160q33 0 56.5 23.5T760-440v69q0 24-13 44.5T711-297l-191 80v97q0 17-11.5 28.5T480-80q-17 0-28.5-11.5T440-120v-97Zm";

export function IconLda({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "0-87v-136H280v69l160 67Zm80 0 160-67v-69H520v136Z" : start + "-40-503h160v-80H400v80Zm40 416v-136H280v69l160 67Zm80 0 160-67v-69H520v136ZM400-720v-80 80Z"} /></Icon>;
}
