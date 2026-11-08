// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M320-120q-17 0-28.5-11.5T280-160v-120h400v120q0 17-11.5 28.5T640-120H320Zm440-520v120q0 3-2 8l-30 152q-3 18-16.5 29T680-320H280q-18 0-31.5-11T232-360l-30-152q-2-5-2-8v-240q0-33 23.5-56.5T280-840h320q33 0 56.5 23.5T680-760v120q0-17 11.5-28.5T720-680q17 0 28.5 11.5T760-640Z";

export function IconSportsMma({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m-380 80h120q25 0 42.5-17.5T560-620q0-25-17.5-42.5T500-680H380q-25 0-42.5 17.5T320-620q0 25 17.5 42.5T380-560Z" : start + "M306-400h348l26-136v-24h-80v-200H280v224l26 136Zm174-180Zm-100 20h120q25 0 42.5-17.5T560-620q0-25-17.5-42.5T500-680H380q-25 0-42.5 17.5T320-620q0 25 17.5 42.5T380-560Z"} /></Icon>;
}
