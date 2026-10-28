// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M792-670q11 11 11 28t-11 28l-29 29q-12 12-28.5 12T706-585q-12-12-11.5-28.5T707-642l29-29q12-11 28.5-10.5T792-670ZM120-160q-17 0-28.5-11.5T80-200q0-17 11.5-28.5T120-240h720q17 0 28.5 11.5T880-200q0 17-11.5 28.5T840-160H120Zm360-640q17 0 28.5 11.5T520-760v40q0 17-11.5 28.5T480-680q-17 0-28.5-11.5T440-720v-40q0-17 11.5-28.5T480-800ZM170-672q11-11 28-11t28 11l29 29q12 12 12 28.5T255-586q-12 11-29 11t-28-12l-29-29q-11-12-10.5-28.5T170-672Zm";

export function WbTwilight({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "30 352q0-117 81.5-198.5T480-600q117 0 198.5 81.5T760-320H200Z" : start + "127 272h366q-23-54-72-87t-111-33q-62 0-111 33t-72 87Zm-97 80q0-117 81.5-198.5T480-600q117 0 198.5 81.5T760-320H200Zm280-80Z"} /></Icon>;
}
