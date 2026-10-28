// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M270-520q13 0 21.5-8.5T300-550v-20q0-13-8.5-21.5T270-600q-13 0-21.5 8.5T240-570v20q0 13 8.5 21.5T270-520Zm100 80q13 0 21.5-8.5T400-470v-180q0-13-8.5-21.5T370-680q-13 0-21.5 8.5T340-650v180q0 13 8.5 21.5T370-440Zm110 80q13 0 21.5-8.5T510-390v-340q0-13-8.5-21.5T480-760q-13 0-21.5 8.5T450-730v340q0 13 8.5 21.5T480-360Zm110-80q13 0 21.5-8.5T620-470v-180q0-13-8.5-21.5T590-680q-13 0-21.5 8.5T560-650v180q0 13 8.5 21.5T590-440Zm100-80q13 0 21.5-8.5T720-550v-20q0-13-8.5-21.5T690-600q-13 0-21.5 8.5T660-570v20q0 13 8.5 21.5T690-520ZM240-240l-92 92q-19 19-43.5 8.5T80-177v-623q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240Z";

export function VoiceChat({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m-34-80h594v-480H160v525l46-45Zm-46 0v-480 480Z"} /></Icon>;
}
