// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M480-50q-29 0-49.5-20.5T410-120H120q-17 0-28.5-11.5T80-160q0-17 11.5-28.5T120-200h40v-560q0-33 23.5-56.5T240-840h480q33 0 56.5 23.5T800-760v560h40q17 0 28.5 11.5T880-160q0 17-11.5 28.5T840-120H550q0 29-20.5 49.5T480-50ZM240-";

export function IconRollerShadesClosed({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200h200v-80H240v80Zm280 0h200v-80H520v80Z" : start + "360h480v-400H240v400Zm0 160h200v-80H240v80Zm280 0h200v-80H520v80ZM240-760h480-480Z"} /></Icon>;
}
