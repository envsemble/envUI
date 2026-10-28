// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "m574-129-214-75-186 72q-10 4-19.5 2.5T137-136q-8-5-12.5-13.5T120-169v-561q0-13 7.5-23t20.5-15l186-63q6-2 12.5-3t13.5-1q7 0 13.5 1t12.5 3l214 75 186-72q10-4 19.5-2.5T823-824q8 5 12.5 13.5T840-791v561q0 13-7.5 23T812-192l-186 63q-6 2-12.5 3t-13.5 1q-7 0-13.5-1t-12.5-3Zm-14-89v-468l-160-56v468l160 56Z";

export function Map({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"} /></Icon>;
}
