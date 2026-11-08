// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v640q0 33-23.5 56.5T800-80H160Zm";

export function IconGarage({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "200-320q-17 0-28.5-11.5T320-440q0-17 11.5-28.5T360-480q17 0 28.5 11.5T400-440q0 17-11.5 28.5T360-400Zm240 0q-17 0-28.5-11.5T560-440q0-17 11.5-28.5T600-480q17 0 28.5 11.5T640-440q0 17-11.5 28.5T600-400ZM240-220q17 0 28.5-11.5T280-260v-40h400v40q0 17 11.5 28.5T720-220q17 0 28.5-11.5T760-260v-243q0-7-1-13.5t-3-12.5l-54-157q-8-24-29-39t-47-15H334q-26 0-47 15t-29 39l-54 157q-2 6-3 12.5t-1 13.5v243q0 17 11.5 28.5T240-220Zm66-360 28-80h292l28 80H306Z" : start + "0-80h640v-640H160v640Zm200-240q-17 0-28.5-11.5T320-440q0-17 11.5-28.5T360-480q17 0 28.5 11.5T400-440q0 17-11.5 28.5T360-400Zm240 0q-17 0-28.5-11.5T560-440q0-17 11.5-28.5T600-480q17 0 28.5 11.5T640-440q0 17-11.5 28.5T600-400ZM240-220q17 0 28.5-11.5T280-260v-40h400v40q0 17 11.5 28.5T720-220q17 0 28.5-11.5T760-260v-243q0-7-1-13.5t-3-12.5l-54-157q-8-24-29-39t-47-15H334q-26 0-47 15t-29 39l-54 157q-2 6-3 12.5t-1 13.5v243q0 17 11.5 28.5T240-220Zm66-360 28-80h292l28 80H306ZM160-800v640-640Zm120 420v-120h400v120H280Z"} /></Icon>;
}
