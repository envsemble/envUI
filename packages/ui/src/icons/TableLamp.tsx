// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M560-120q-17 0-28.5-11.5T520-160q0-17 11.5-28.5T560-200h240q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120H560Z";

export function TableLamp({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m120-120q-17 0-28.5-11.5T640-280v-360q0-17-11.5-28.5T600-680H440v120q0 17-11.5 28.5T400-520H160q-22 0-34-18t-3-38l95-216q10-22 29.5-35t43.5-13h69q33 0 56.5 23.5T440-760h160q50 0 85 35t35 85v360q0 17-11.5 28.5T680-240Z" : start + "M221-600h139v-160h-69l-70 160Zm459 360q-17 0-28.5-11.5T640-280v-360q0-17-11.5-28.5T600-680H440v120q0 17-11.5 28.5T400-520H160q-22 0-34-18t-3-38l95-216q10-22 29.5-35t43.5-13h69q33 0 56.5 23.5T440-760h160q50 0 85 35t35 85v360q0 17-11.5 28.5T680-240ZM221-600h139-139Z"} /></Icon>;
}
