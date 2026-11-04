// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h520q17 0 28.5 11.5T800-840q0 17-11.5 28.5T760-800h-40v80q0 17-11.5 28.5T680-680H360q-17 0-28.5-11.5T320-720v-80h-80v640h162q-38-27-60-68.5T320-320v-120q0-33 23.5-56.5T400-520h240q33 0 56.5 23.5T720-440v120q0 50-22 91.5T638-160h122q17 0 28.5 11.5T800-120q0 17-11.5 28.5T760-80H240Zm280-";

export function IconCoffeeMaker({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "480q17 0 28.5-11.5T560-600q0-17-11.5-28.5T520-640q-17 0-28.5 11.5T480-600q0 17 11.5 28.5T520-560Z" : start + "120q50 0 85-35t35-85v-120H400v120q0 50 35 85t85 35Zm0-360q17 0 28.5-11.5T560-600q0-17-11.5-28.5T520-640q-17 0-28.5 11.5T480-600q0 17 11.5 28.5T520-560Zm0 120Z"} /></Icon>;
}
