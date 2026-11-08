// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M800-160q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640Z";

export function IconPictureInPictureMobile({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M680-480v-240q0-17-11.5-28.5T640-760H480q-17 0-28.5 11.5T440-720v240q0 17 11.5 28.5T480-440h160q17 0 28.5-11.5T680-480Z" : start + "m-80 0v-640H240v640h480Zm0-640H240h480Zm-40 320v-240q0-17-11.5-28.5T640-760H480q-17 0-28.5 11.5T440-720v240q0 17 11.5 28.5T480-440h160q17 0 28.5-11.5T680-480Zm-80-40h-80v-160h80v160Z"} /></Icon>;
}
