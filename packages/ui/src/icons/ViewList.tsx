// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconViewList({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M840-480ZM160-600q-17 0-28.5-11.5T120-640v-80q0-17 11.5-28.5T160-760h80q17 0 28.5 11.5T280-720v80q0 17-11.5 28.5T240-600h-80Zm200 0q-17 0-28.5-11.5T320-640v-80q0-17 11.5-28.5T360-760h440q17 0 28.5 11.5T840-720v80q0 17-11.5 28.5T800-600H360Zm0 200q-17 0-28.5-11.5T320-440v-80q0-17 11.5-28.5T360-560h440q17 0 28.5 11.5T840-520v80q0 17-11.5 28.5T800-400H360Zm0 200q-17 0-28.5-11.5T320-240v-80q0-17 11.5-28.5T360-360h440q17 0 28.5 11.5T840-320v80q0 17-11.5 28.5T800-200H360Zm-200 0q-17 0-28.5-11.5T120-240v-80q0-17 11.5-28.5T160-360h80q17 0 28.5 11.5T280-320v80q0 17-11.5 28.5T240-200h-80Zm0-200q-17 0-28.5-11.5T120-440v-80q0-17 11.5-28.5T160-560h80q17 0 28.5 11.5T280-520v80q0 17-11.5 28.5T240-400h-80Z" /> : <path d="M120-280v-400q0-33 23.5-56.5T200-760h560q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H200q-33 0-56.5-23.5T120-280Zm80-320h80v-80h-80v80Zm160 0h400v-80H360v80Zm0 160h400v-80H360v80Zm0 160h400v-80H360v80Zm-160 0h80v-80h-80v80Zm0-160h80v-80h-80v80Z" />}</Icon>;
}
