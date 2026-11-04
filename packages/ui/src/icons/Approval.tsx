// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-160q0-33 23.5-56.5T240-400h480q33 0 56.5 23.5T800-320v160q0 33-23.5 56.5T720-80H240Zm40-160h400q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320H280q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm167-206L299-653q-9-13-12.5-28.5T285-713q12-73 66-120t129-47q75 0 129 47t66 120q2 16-1.5 31.5T661-653L513-446q-12 17-33 17t-33-17Z";

export function IconApproval({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m33-66 120-168q0-50-35-85t-85-35q-50 0-85 35t-35 85l120 168Zm0-144Z"} /></Icon>;
}
