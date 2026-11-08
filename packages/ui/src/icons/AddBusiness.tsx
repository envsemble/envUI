// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M720-160h-80q-17 0-28.5-11.5T600-200q0-17 11.5-28.5T640-240h80v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80h80q17 0 28.5 11.5T920-200q0 17-11.5 28.5T880-160h-80v80q0 17-11.5 28.5T760-40q-17 0-28.5-11.5T720-80v-80Zm-600 0q-17 0-28.5-11.5T80-200v-200h-7q-19 0-31-14.5T34-448l40-200q3-14 14-23t25-9h534q14 0 25 9t14 23l40 200q4 19-8 33.5T687-400h-7v80q0 17-11.5 28.5T640-280q-17 0-28.5-11.5T600-320v-80H440v200q0 17-11.5 28.5T400-160H120Zm40-80h200v-160H160v160Zm-";

export function IconAddBusiness({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "40-480q-17 0-28.5-11.5T80-760q0-17 11.5-28.5T120-800h520q17 0 28.5 11.5T680-760q0 17-11.5 28.5T640-720H120Z" : start + "38-240h516-516Zm-2-240q-17 0-28.5-11.5T80-760q0-17 11.5-28.5T120-800h520q17 0 28.5 11.5T680-760q0 17-11.5 28.5T640-720H120Zm2 240h516l-24-120H146l-24 120Z"} /></Icon>;
}
