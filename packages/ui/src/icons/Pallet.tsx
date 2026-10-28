// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M200-160v50q0 17-11.5 28.5T160-70h-40q-17 0-28.5-11.5T80-110v-90q0-17 11.5-28.5T120-240h720q17 0 28.5 11.5T880-200v90q0 17-11.5 28.5T840-70h-40q-17 0-28.5-11.5T760-110v-50H540v50q0 17-11.5 28.5T500-70h-40q-17 0-28.5-11.5T420-110v-50H200Zm40-160q-17 0-28.5-11.5T200-360v-480q0-17 11.5-28.5T240-880h480q17 0 28.5 11.5T760-840v480q0 17-11.5 28.5T720-320H240Zm";

export function Pallet({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "320-320q17 0 28.5-11.5T600-680q0-17-11.5-28.5T560-720H400q-17 0-28.5 11.5T360-680q0 17 11.5 28.5T400-640h160Z" : start + "40-80h400v-400H280v400Zm280-240q17 0 28.5-11.5T600-680q0-17-11.5-28.5T560-720H400q-17 0-28.5 11.5T360-680q0 17 11.5 28.5T400-640h160ZM280-400v-400 400Z"} /></Icon>;
}
