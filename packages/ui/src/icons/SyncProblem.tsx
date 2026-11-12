// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-280q-17 0-28.5-11.5T440-320q0-17 11.5-28.5T480-360q17 0 28.5 11.5T520-320q0 17-11.5 28.5T480-280Zm0-160q-17 0-28.5-11.5T440-480v-160q0-17 11.5-28.5T480-680q17 0 28.5 11.5T520-640v160q0 17-11.5 28.5T480-440Zm-280-40q0 54 21.5 99.5T280-302v-58q0-17 11.5-28.5T320-400q17 0 28.5 11.5T360-360v160q0 17-11.5 28.5T320-160H160q-17 0-28.5-11.5T120-200q0-17 11.5-28.5T160-240h69q-51-44-80-106t-29-134q0-94 49-170t128-116q14-8 29.5-1t20.5 23q5 16-1.5 31T325-690q-56 31-90.5 86.5T200-480Zm560 ";

export function IconSyncProblem({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "21q0-54-21.5-99.5T680-637v58q0 17-11.5 28.5T640-539q-17 0-28.5-11.5T600-579v-160q0-17 11.5-28.5T640-779h160q17 0 28.5 11.5T840-739q0 17-11.5 28.5T800-699h-69q51 44 80 106t29 134q0 94-49 170.5T663-172q-14 8-29.5.5T613-195q-5-16 1.5-31t20.5-23q56-31 90.5-86.5T760-459Z" : start + "0q0-54-21.5-99.5T680-658v58q0 17-11.5 28.5T640-560q-17 0-28.5-11.5T600-600v-160q0-17 11.5-28.5T640-800h160q17 0 28.5 11.5T840-760q0 17-11.5 28.5T800-720h-69q51 44 80 106t29 134q0 94-49 170.5T663-193q-14 8-29.5.5T613-216q-5-16 1.5-31t20.5-23q56-31 90.5-86.5T760-480Z"} /></Icon>;
}
