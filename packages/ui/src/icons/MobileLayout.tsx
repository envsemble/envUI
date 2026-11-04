// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M120-120q-33 0-56.5-23.5T40-200v-80q0-33 23.5-56.5T120-360h240q33 0 56.5 23.5T440-280v80q0 33-23.5 56.5T360-120H120Zm480 0q-33 0-56.5-23.5T520-200v-560q0-33 23.5-56.5T600-840h240q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120H600Zm";

export function IconMobileLayout({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "120-120q17 0 28.5-11.5T760-280q0-17-11.5-28.5T720-320q-17 0-28.5 11.5T680-280q0 17 11.5 28.5T720-240ZM120-440q-33 0-56.5-23.5T40-520v-240q0-33 23.5-56.5T120-840h240q33 0 56.5 23.5T440-760v240q0 33-23.5 56.5T360-440H120Zm160-200q17 0 28.5-11.5T320-680q0-17-11.5-28.5T280-720q-17 0-28.5 11.5T240-680q0 17 11.5 28.5T280-640ZM150-520h100q12 0 18-11t-2-21l-50-67q-6-8-16-8t-16 8l-50 67q-8 10-2 21t18 11Z" : start + "-480-80h240v-80H120v80Zm480 0h240v-560H600v560Zm120-40q17 0 28.5-11.5T760-280q0-17-11.5-28.5T720-320q-17 0-28.5 11.5T680-280q0 17 11.5 28.5T720-240ZM120-440q-33 0-56.5-23.5T40-520v-240q0-33 23.5-56.5T120-840h240q33 0 56.5 23.5T440-760v240q0 33-23.5 56.5T360-440H120Zm160-200q17 0 28.5-11.5T320-680q0-17-11.5-28.5T280-720q-17 0-28.5 11.5T240-680q0 17 11.5 28.5T280-640Zm80 120v-240H120v227l64-86q6-8 16-8t16 8l74 99h70ZM240-240Zm480-240ZM240-640Z"} /></Icon>;
}
