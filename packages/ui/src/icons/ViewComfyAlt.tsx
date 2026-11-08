// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M320-560H160q-33 0-56.5-23.5T80-640v-160q0-33 23.5-56.5T160-880h160q33 0 56.5 23.5T400-800v160q0 33-23.5 56.5T320-560Zm";

export function IconViewComfyAlt({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "0 480H160q-33 0-56.5-23.5T80-160v-160q0-33 23.5-56.5T160-400h160q33 0 56.5 23.5T400-320v160q0 33-23.5 56.5T320-80Zm480-480H640q-33 0-56.5-23.5T560-640v-160q0-33 23.5-56.5T640-880h160q33 0 56.5 23.5T880-800v160q0 33-23.5 56.5T800-560Zm0 480H640q-33 0-56.5-23.5T560-160v-160q0-33 23.5-56.5T640-400h160q33 0 56.5 23.5T880-320v160q0 33-23.5 56.5T800-80Z" : start + "-160-80h160v-160H160v160ZM320-80H160q-33 0-56.5-23.5T80-160v-160q0-33 23.5-56.5T160-400h160q33 0 56.5 23.5T400-320v160q0 33-23.5 56.5T320-80Zm-160-80h160v-160H160v160Zm640-400H640q-33 0-56.5-23.5T560-640v-160q0-33 23.5-56.5T640-880h160q33 0 56.5 23.5T880-800v160q0 33-23.5 56.5T800-560Zm-160-80h160v-160H640v160ZM800-80H640q-33 0-56.5-23.5T560-160v-160q0-33 23.5-56.5T640-400h160q33 0 56.5 23.5T880-320v160q0 33-23.5 56.5T800-80Zm-160-80h160v-160H640v160ZM320-640Zm0 320Zm320-320Zm0 320Z"} /></Icon>;
}
