// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M600-200q-17 0-28.5-11.5T560-240q0-17 11.5-28.5T600-280h240q17 0 28.5 11.5T880-240q0 17-11.5 28.5T840-200H600ZM439-82q-70 0-131-32.5T197-197q-57-57-87-130T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q156 0 268 101.5T877-525q2 18-9.5 31.5T838-480q-15 0-26.5-9.5T798-514q-5-29-9.5-50.5T770-615L432-278q13 16 27.5 29.5T491-222q20 16 27 40t-2 48q-9 25-30 38.5T439-82Zm-50-265 337-337q-11-12-22-23.5T680-729L367-415q4 18 9 34.5t13 33.5Zm-26-178 247-247q-8-3-14.5-6.5T581-784q-86 28-145.5 97.5T363-525Z";

export function IconEvShadowMinus({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start : start + "m-203 45q0 121 78.5 211T436-163q-72-55-114-137.5T280-480q0-97 42-179.5T436-797q-118 16-197 105.5T160-480Zm120 0Z"} /></Icon>;
}
