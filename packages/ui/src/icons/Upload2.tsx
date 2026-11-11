// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M200-160h560q17 0 28.5 11.5T800-120q0 17-11.5 28.5T760-80H200q-17 0-28.5-11.5T160-120q0-17 11.5-28.5T200-160Zm200-80q-17 0-28.5-11.5T360-280v-240h-78q-25 0-36-22.5t4-42.5l198-254q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l198 254q15 20 4 42.5T678-520h-78v240q0 17-11.5 28.5T560-240H400Z";

export function IconUpload2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m40-80h80v-280h76L480-750 364-600h76v280Zm40-280Z"} /></Icon>;
}
