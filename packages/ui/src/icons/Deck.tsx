// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M440-120v-480H143q-15 0-19-14t8-22l325-228q11-8 23-8t23 8l325 228q12 8 8 22t-19 14H520v480q0 17-11.5 28.5T480-80q-17 0-28.5-11.5T440-120Zm";

export function IconDeck({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-320 0v-170L95-427q-3-17 6-30t26-16q16-3 29.5 6.5T173-441l23 121h124q17 0 28.5 11.5T360-280v160q0 17-11.5 28.5T320-80q-17 0-28.5-11.5T280-120v-120h-80v120q0 17-11.5 28.5T160-80q-17 0-28.5-11.5T120-120Zm480 0v-160q0-17 11.5-28.5T640-320h124l23-121q3-16 16-25.5t30-6.5q17 3 26 16t6 30l-25 137v170q0 17-11.5 28.5T800-80q-17 0-28.5-11.5T760-120v-120h-80v120q0 17-11.5 28.5T640-80q-17 0-28.5-11.5T600-120Z" : start + "40-560h146-292 146ZM120-120v-170L95-427q-3-17 6-30t26-16q16-3 29.5 6.5T173-441l23 121h124q17 0 28.5 11.5T360-280v160q0 17-11.5 28.5T320-80q-17 0-28.5-11.5T280-120v-120h-80v120q0 17-11.5 28.5T160-80q-17 0-28.5-11.5T120-120Zm480 0v-160q0-17 11.5-28.5T640-320h124l23-121q3-16 16-25.5t30-6.5q17 3 26 16t6 30l-25 137v170q0 17-11.5 28.5T800-80q-17 0-28.5-11.5T760-120v-120h-80v120q0 17-11.5 28.5T640-80q-17 0-28.5-11.5T600-120ZM334-680h292L480-782 334-680Z"} /></Icon>;
}
