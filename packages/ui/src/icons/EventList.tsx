// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M640-120q-33 0-56.5-23.5T560-200v-160q0-33 23.5-56.5T640-440h160q33 0 56.5 23.5T880-360v160q0 33-23.5 56.5T800-120H640Z";

export function IconEventList({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M120-240q-17 0-28.5-11.5T80-280q0-17 11.5-28.5T120-320h280q17 0 28.5 11.5T440-280q0 17-11.5 28.5T400-240H120Zm520-280q-33 0-56.5-23.5T560-600v-160q0-33 23.5-56.5T640-840h160q33 0 56.5 23.5T880-760v160q0 33-23.5 56.5T800-520H640ZM120-640q-17 0-28.5-11.5T80-680q0-17 11.5-28.5T120-720h280q17 0 28.5 11.5T440-680q0 17-11.5 28.5T400-640H120Z" : start + "m0-80h160v-160H640v160Zm-520-40q-17 0-28.5-11.5T80-280q0-17 11.5-28.5T120-320h280q17 0 28.5 11.5T440-280q0 17-11.5 28.5T400-240H120Zm520-280q-33 0-56.5-23.5T560-600v-160q0-33 23.5-56.5T640-840h160q33 0 56.5 23.5T880-760v160q0 33-23.5 56.5T800-520H640Zm0-80h160v-160H640v160Zm-520-40q-17 0-28.5-11.5T80-680q0-17 11.5-28.5T120-720h280q17 0 28.5 11.5T440-680q0 17-11.5 28.5T400-640H120Zm600 360Zm0-400Z"} /></Icon>;
}
