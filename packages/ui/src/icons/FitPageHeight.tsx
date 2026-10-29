// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm";

export function IconFitPageHeight({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "168-520h144q14 0 19-12t-5-22l-58-58q-12-12-28-12t-28 12l-58 58q-10 10-5 22t19 12Zm100 332 58-58q10-10 5-22t-19-12H408q-14 0-19 12t5 22l58 58q12 12 28 12t28-12Z" : start + "480-80v-640H240v640h480Zm0-640H240h480ZM408-600h144q14 0 19-12t-5-22l-58-58q-12-12-28-12t-28 12l-58 58q-10 10-5 22t19 12Zm100 332 58-58q10-10 5-22t-19-12H408q-14 0-19 12t5 22l58 58q12 12 28 12t28-12Z"} /></Icon>;
}
