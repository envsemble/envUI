// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M524-40q-84 0-157.5-32t-128-86.5Q184-213 152-286.5T120-444q0-128 72-232t193-146q22-8 41 5.5t18 36.5q-3 85 27 162t90 137q60 60 137 90t162 27q26-1 38.5 17.5T903-305q-44 120-147.5 192.5T524-40Z";

export function QuietTime({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m0-80q88 0 163-44t118-121q-86-8-163-43.5T504-425q-61-61-97-138t-43-163q-77 43-120.5 118.5T200-444q0 135 94.5 229.5T524-120Zm-20-305Z"} /></Icon>;
}
