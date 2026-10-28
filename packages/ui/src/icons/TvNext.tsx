// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "m840-240-90-90q-13-13-13-30t13-30q13-13 30-13t30 13l122 122q12 12 12 28t-12 28L810-90q-13 13-30 13t-30-13q-13-13-13-30t13-30l90-90ZM360-120q-17 0-28.5-11.5T320-160v-40H160q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v240q0 17-11.5 28.5T840-480";

export function TvNext({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "h-80q-33 0-56.5 23.5T680-400v160q0 17-11.5 28.5T640-200h-40v40q0 17-11.5 28.5T560-120H360Z" : start + "q-17 0-28.5-11.5T800-520v-240H160v480h480q17 0 28.5 11.5T680-240q0 17-11.5 28.5T640-200h-40v40q0 17-11.5 28.5T560-120H360ZM160-280v-480 480Z"} /></Icon>;
}
