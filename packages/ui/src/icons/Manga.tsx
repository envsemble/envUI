// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm164-80";

export function IconManga({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "h476v-439l-120 39-96-31q-12-4-24-.5T540-657l-60 82-96 31q-13 4-20 14.5t-7 23.5v101l-59 81q-8 11-8 23.5t8 23.5l26 37Z" : start + "-26-37q-8-11-8-23.5t8-23.5l59-81v-101q0-13 7-23.5t20-14.5l96-31 60-82q8-11 20-14.5t24 .5l96 31 120-39v-41H160v480h164Zm99 0h377v-309l-27-37-93 30-92-30-58 79-93 30v98l-57 79 43 60Zm14-237Z"} /></Icon>;
}
