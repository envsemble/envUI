// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M720-160v-560H240v560H120q-33 0-56.5-23.5T40-240v-480q0-33 23.5-56.5T120-800h720q33 0 56.5 23.5T920-720v480q0 33-23.5 56.5T840-160H720ZM";

export function IconTabletCamera({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "360-80q-25 0-42.5-17.5T300-140v-160q0-25 17.5-42.5T360-360h40l40-40h80l40 40h40q25 0 42.5 17.5T660-300v160q0 25-17.5 42.5T600-80H360Zm120-70q29 0 49.5-20.5T550-220q0-29-20.5-49.5T480-290q-29 0-49.5 20.5T410-220q0 29 20.5 49.5T480-150Z" : start + "160-720h-40v480h40v-480Zm640 0v480h40v-480h-40Zm0 0h40-40Zm-640 0h-40 40ZM360-80q-25 0-42.5-17.5T300-140v-160q0-25 17.5-42.5T360-360h40l40-40h80l40 40h40q25 0 42.5 17.5T660-300v160q0 25-17.5 42.5T600-80H360Zm120-70q29 0 49.5-20.5T550-220q0-29-20.5-49.5T480-290q-29 0-49.5 20.5T410-220q0 29 20.5 49.5T480-150Z"} /></Icon>;
}
