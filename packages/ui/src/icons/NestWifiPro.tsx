// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M480-280q25 0 42.5-17.5T540-340q0-25-17.5-42.5T480-400q-25 0-42.5 17.5T420-340q0 25 17.5 42.5T480-280ZM360-80q-77 0-124-40t-73-100q-26-61-34.5-130T120-479q0-102 15.5-176.5T192-781q41-50 110-74.5T480-880q109 0 178 24.5T768-781q41 51 56.5 125.5T840-479q0 60-8.5 129T797-220q-26 60-73 100T600-80H360Z";

export function IconNestWifiPro({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m-1-80h240q54 0 85-35t48-86q17-51 22-105.5t5-92.5q0-85-10-145.5T708-724q-30-39-84.5-57.5T479-800q-90 0-144.5 18.5T250-724q-31 39-41 99.5T199-479q0 38 5 92.5T226-281q17 51 48 86t85 35Zm120-320Z"} /></Icon>;
}
