// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M300-160q-58 0-99-41t-41-99q0-58 41-99t99-41h440q58 0 99 41t41 99q0 58-41 99t-99 41H300Zm";

export function IconViewObjectTrack({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-80-360q-58 0-99-41t-41-99q0-58 41-99t99-41h440q58 0 99 41t41 99q0 58-41 99t-99 41H220Z" : start + "0-80h440q25 0 42.5-17.5T800-300q0-25-17.5-42.5T740-360H300q-25 0-42.5 17.5T240-300q0 25 17.5 42.5T300-240Zm-80-280q-58 0-99-41t-41-99q0-58 41-99t99-41h440q58 0 99 41t41 99q0 58-41 99t-99 41H220Zm0-80h440q25 0 42.5-17.5T720-660q0-25-17.5-42.5T660-720H220q-25 0-42.5 17.5T160-660q0 25 17.5 42.5T220-600Zm300 300Zm-80-360Z"} /></Icon>;
}
