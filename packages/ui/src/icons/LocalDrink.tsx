// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M279-80q-31 0-53.5-20.5T200-151l-69-630q-5-40 22-69.5t67-29.5h520q40 0 67 29.5t22 69.5l-69 630q-3 30-25.5 50.5T681-80H279Zm-";

export function IconLocalDrink({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "53-560h508l16-160H210l16 160Zm254 440q48 0 81-33t33-81q0-47-27.5-91T511-483q-6-8-14.5-11.5T480-498q-8 0-16.5 3.5T449-483q-28 34-55.5 78T366-314q0 48 33 81t81 33Z" : start + "43-480 44 400h400l44-400H236Zm-10-80h508l16-160H210l16 160Zm254 360q-14 0-24-10t-10-24q0-15 8.5-34.5T480-393q17 25 25.5 44.5T514-314q0 14-10 24t-24 10Zm0 80q48 0 81-33t33-81q0-47-27.5-91T511-483q-6-8-14.5-11.5T480-498q-8 0-16.5 3.5T449-483q-28 34-55.5 78T366-314q0 48 33 81t81 33Zm-244 40h488-488Z"} /></Icon>;
}
