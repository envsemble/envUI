// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h323q18 0 34 7.5t27 21.5l157 189q9 11 14 24t5 27v";

export function FindInPage({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "363q0 20-18.5 27.5T749-227L618-360q11-17 16.5-37t5.5-43q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47q23 0 43-5.5t37-16.5l155 154q19 19 9 43.5T687-80H240Zm240-280q-33 0-56.5-23.5T400-440q0-33 23.5-56.5T480-520q33 0 56.5 23.5T560-440q0 33-23.5 56.5T480-360Z" : start + "451q0 27-24.5 37t-43.5-9L560-302q-17 11-37 16.5t-43 5.5q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 43T618-360l102 104v-356L562-800H240v640h333q20 0 30 12.5t10 27.5q0 15-10 27.5T573-80H240Zm240-280q33 0 56.5-23.5T560-440q0-33-23.5-56.5T480-520q-33 0-56.5 23.5T400-440q0 33 23.5 56.5T480-360Zm0-80Zm0 0Z"} /></Icon>;
}
