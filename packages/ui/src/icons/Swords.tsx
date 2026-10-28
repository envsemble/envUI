// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M762-96 645-212l-60 60q-11 11-28 11t-28-11q-23-23-23-57t23-57l169-169q23-23 57-23t57 23q11 11 11 28t-11 28l-60 60 116 117q12 12 12 28t-12 28l-50 50q-12 12-28 12t-28-12Zm106-616L426-270l5 4q23 23 23 57t-23 57q-11 11-28 11t-28-11l-60-60L198-96q-12 12-28 12t-28-12l-50-50q-12-12-12-28t12-28l116-117-60-60q-11-11-11-28t11-28q23-23 57-23t57 23l4 5 431-431q11-11 25.5-17t30.5-6h87q17 0 28.5 11.5T880-844v103q0 8-3 15.5t-9 13.5ZM";

export function Swords({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "249-555 103-701q-11-11-17-25.5T80-757v-87q0-17 11.5-28.5T120-884h87q16 0 30.5 6t25.5 17l146 146q12 12 12 28.5T409-658L306-555q-12 12-28.5 12T249-555Z" : start + "334-583l24-23 23-24-23 24-24 23Zm-85 28L103-701q-11-11-17-25.5T80-757v-87q0-17 11.5-28.5T120-884h87q16 0 30.5 6t25.5 17l147 147q12 12 11.5 28T409-658q-12 11-28 11.5T353-658L207-804h-47v47l146 146q11 11 11 27.5T306-555q-12 12-28.5 12T249-555Zm121 228 430-430v-47h-47L323-374l47 47Zm0 0-24-23-23-24 23 24 24 23Z"} /></Icon>;
}
