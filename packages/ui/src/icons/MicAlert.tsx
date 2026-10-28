// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M400-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm";

export function MicAlert({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "280 240q8 0 14-6t6-14q0-8-6-14t-14-6q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80q8 0 14-6t6-14v-120q0-8-6-14t-14-6q-8 0-14 6t-6 14v120q0 8 6 14t14 6Zm0 160q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80Zm-320-80v-83q-92-13-157.5-78T123-479q-2-17 9-29t28-12q17 0 28.5 11.5T204-480q15 75 72.5 117T409-321q13 0 22 8t9 20v133q0 17-11.5 28.5T400-120q-17 0-28.5-11.5T360-160Z" : start + "0-80q17 0 28.5-11.5T440-520v-240q0-17-11.5-28.5T400-800q-17 0-28.5 11.5T360-760v240q0 17 11.5 28.5T400-480Zm280 320q8 0 14-6t6-14q0-8-6-14t-14-6q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80q8 0 14-6t6-14v-120q0-8-6-14t-14-6q-8 0-14 6t-6 14v120q0 8 6 14t14 6Zm0 160q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM400-640Zm-40 480v-83q-92-13-157.5-78T123-479q-2-17 9-29t28-12q17 0 28.5 11.5T204-480q15 75 72.5 117T409-321q13 0 22 8t9 20v133q0 17-11.5 28.5T400-120q-17 0-28.5-11.5T360-160Z"} /></Icon>;
}
