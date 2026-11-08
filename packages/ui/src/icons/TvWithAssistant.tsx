// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M420-460q17 0 28.5-11.5T460-500q0-17-11.5-28.5T420-540q-17 0-28.5 11.5T380-500q0 17 11.5 28.5T420-460Zm120 0q17 0 28.5-11.5T580-500q0-17-11.5-28.5T540-540q-17 0-28.5 11.5T500-500q0 17 11.5 28.5T540-460Zm-240 0q17 0 28.5-11.5T340-500q0-17-11.5-28.5T300-540q-17 0-28.5 11.5T260-500q0 17 11.5 28.5T300-460Zm360 0q17 0 28.5-11.5T700-500q0-17-11.5-28.5T660-540q-17 0-28.5 11.5T620-500q0 17 11.5 28.5T660-460ZM227-200l-22 66q-2 6-7 10t-12 4h-6q-8 0-14-6t-6-14v-60q-33 0-56.5-23.5T80-280v-440q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v440q0 33-23.5 56.5T800-200v61q0 8-5.5 13.5T781-120h-7q-6 0-11-3.5t-7-9.5l-22-67H227Z";

export function IconTvWithAssistant({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m-67-80h640v-440H160v440Zm320-220Z"} /></Icon>;
}
