// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ShieldCard({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M520-80q-33 0-56.5-23.5T440-160v-200q0-33 23.5-56.5T520-440h320q33 0 56.5 23.5T920-360v200q0 33-23.5 56.5T840-80H520Zm0-80h320v-80H520v80Zm0-160h320v-40H520v40ZM160-516v-189q0-25 14.5-45t37.5-29l250-94q8-3 18-3t18 3l250 94q23 9 37.5 29t14.5 45v145q0 17-11.5 28.5T760-520H520q-66 0-113 47t-47 113v143q1 26-22 36.5t-42-6.5q-63-63-99.5-149T160-516Z" /> : <path d="M520-80q-33 0-56.5-23.5T440-160v-200q0-33 23.5-56.5T520-440h320q33 0 56.5 23.5T920-360v200q0 33-23.5 56.5T840-80H520Zm0-80h320v-80H520v80Zm0-160h320v-40H520v40Zm-40-195ZM305-178q-69-66-107-154.5T160-516v-189q0-25 14.5-45t37.5-29l250-94q8-3 18-3t18 3l250 94q23 9 37.5 29t14.5 45v145q0 17-11.5 28.5T760-520q-17 0-28.5-11.5T720-560v-145l-240-90-240 90v189q0 81 32.5 154.5T360-236q12 11 12.5 28T362-179q-11 12-28 12t-29-11Z" />}</Icon>;
}
