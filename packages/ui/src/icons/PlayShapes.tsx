// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M148-520q-23 0-34.5-19.5T113-579l132-238q11-20 35-20t35 20l132 238q11 20-.5 39.5T412-520H148Zm132 400q-66 0-113-47t-47-113q0-6";

export function PlayShapes({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "6 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm280 0q-17 0-28.5-11.5T520-160v-240q0-17 11.5-28.5T560-440h240q17 0 28.5 11.5T840-400v240q0 17-11.5 28.5T800-120H560Zm64-580-76-76q-11-11-11-28t11-28q11-11 28-11t28 11l76 76 76-76q11-11 28-11t28 11q11 11 11 28t-11 28l-76 76 76 76q11 11 11 28t-11 28q-11 11-28 11t-28-11l-76-76-76 76q-11 11-28 11t-28-11q-11-11-11-28t11-28l76-76Z" : start + "7 47-113.5T280-440q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T360-280q0-33-23.5-56.5T280-360q-33 0-56.5 23.5T200-280q0 33 23.5 56.5T280-200Zm-64-400h128l-64-115-64 115Zm344 480q-17 0-28.5-11.5T520-160v-240q0-17 11.5-28.5T560-440h240q17 0 28.5 11.5T840-400v240q0 17-11.5 28.5T800-120H560Zm40-80h160v-160H600v160ZM280-658Zm0 378Zm400 0Zm-56-420-76-76q-11-11-11-28t11-28q11-11 28-11t28 11l76 76 76-76q11-11 28-11t28 11q11 11 11 28t-11 28l-76 76 76 76q11 11 11 28t-11 28q-11 11-28 11t-28-11l-76-76-76 76q-11 11-28 11t-28-11q-11-11-11-28t11-28l76-76Z"} /></Icon>;
}
