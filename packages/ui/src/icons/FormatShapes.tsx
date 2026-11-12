// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m327-361 114-300q3-9 11-14t17-5h22q9 0 17 5t11 14l114 303q5 14-3 26t-23 12q-9 0-17-5.5T579-340l-25-72H408l-25 73q-3 9-11 14t-17 5q-16 0-24.5-13t-3.5-28Zm99-103h108l-52-150h-4l-52 150ZM40-80v-160q0-17 11.5-28.5T80-280h40v-400H80q-17 0-28.5-11.5T40-720v-160q0-17 11.5-28.5T80-920h160q17 0 28.5 11.5T280-880v40h400v-40q0-17 11.5-28.5T720-920h160q17 0 28.5 11.5T920-880v160q0 17-11.5 28.5T880-680h-40v400h40q17 0 28.5 11.5T920-240v160q0 17-11.5 28.5T880-40H720q-17 0-28.5-11.5T680-80v-40H280v40q0 17-11.5 28.5T240-40H80q-17 0-28.5-11.5T40-80Zm240-120h400v-40q0-17 11.5-28.5T720-280h40v-400h-40q-17 0-28.5-11.5T680-720v-40H280v40q0 17-11.5 28.5T240-680h-40v400h40q17 0 28.5 11.5T280-240v40Z";

export function IconFormatShapes({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "M120-760h80v-80h-80v80Zm640 0h80v-80h-80v80Zm0 640h80v-80h-80v80Zm-640 0h80v-80h-80v80Zm80-640Zm560 0Zm0 560Zm-560 0Z"} /></Icon>;
}
