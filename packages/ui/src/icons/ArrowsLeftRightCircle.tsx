// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm";

export function IconArrowsLeftRightCircle({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-72-268q11-11 11-28t-11-28l-36-36h216l-36 36q-11 11-11 28t11 28q11 11 28 11t28-11l104-104q12-12 12-28t-12-28L608-612q-11-11-28-11t-28 11q-11 11-11 28t11 28l36 36H372l36-36q11-11 11-28t-11-28q-11-11-28-11t-28 11L248-508q-12 12-12 28t12 28l104 104q11 11 28 11t28-11Z" : start + "0-80q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Zm0-320Zm-72 132q11-11 11-28t-11-28l-36-36h216l-36 36q-11 11-11 28t11 28q11 11 28 11t28-11l104-104q12-12 12-28t-12-28L608-612q-11-11-28-11t-28 11q-11 11-11 28t11 28l36 36H372l36-36q11-11 11-28t-11-28q-11-11-28-11t-28 11L248-508q-12 12-12 28t12 28l104 104q11 11 28 11t28-11Z"} /></Icon>;
}
