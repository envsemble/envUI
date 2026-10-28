// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "m420-320 46 46q6 6 14 6t14-6l46-46h80q8 0 14-6t6-14v-80l46-46q6-6 6-14t-6-14l-46-46v-80q0-8-6-14t-14-6h-80l-46-46q-6-6-14-6t-14 6l-46 46h-80q-8 0-14 6t-6 14v80l-46 46q-6 6-6 14t6 14l46 46v80q0 8 6 14t14 6h80Zm60-40v-240q50 0 85 35t35 85q0 50-35 85t-85 35ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z";

export function SettingsBrightness({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80h640v-480H160v480Zm0 0v-480 480Z"} /></Icon>;
}
