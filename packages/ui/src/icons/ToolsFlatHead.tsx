// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M360-120q-17 0-28.5-11.5T320-160q0-17 11.5-28.5T360-200h240q17 0 28.5 11.5T640-160q0 17-11.5 28.5T600-120H360Zm-5-120q-15 0-26.5-9.5T315-274l-33-230q-1-8-.5-15.5T284-535l68-275q3-14 14-22t25-8h178q14 0 25 8t14 22l68 275q2 8 2.5 15.5T678-504l-33 230q-2 15-13.5 24.5T605-240H355Zm";

export function ToolsFlatHead({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "17-320h216l-50-200H422l-50 200Z" : start + "34-80h182l22-160H366l23 160Zm-17-240h216l-50-200H422l-50 200Zm199 240H389h182Z"} /></Icon>;
}
