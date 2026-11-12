// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M727-240H600q-17 0-28.5-11.5T560-280q0-17 11.5-28.5T600-320h127l-35-35q-11-12-11.5-28.5T692-412q12-12 28-12t28 12l104 104q12 12 12 28t-12 28L748-148q-12 12-28 12t-28-12q-12-12-11.5-28.5T692-205l35-35Zm-487 0-86 86q-10 10-22 5t-12-19v-552q0-33 23.5-56.5T200-800h480q33 0 56.5 23.5T760-720v1";

export function IconChatPasteGo2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "74q0 12-8.5 19.5T731-520q-51-2-97.5 15.5T550-450q-36 37-54 83.5T480-269q1 12-7 20.5t-19 8.5H240Z" : start + "60q0 17-11.5 28.5T720-520q-17 0-28.5-11.5T680-560v-160H200v400h240q17 0 28.5 11.5T480-280q0 17-11.5 28.5T440-240H240Zm-40-80v-400 400Z"} /></Icon>;
}
