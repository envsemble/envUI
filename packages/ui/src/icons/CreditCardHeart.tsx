// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function CreditCardHeart({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M716-157q-8 0-15-2.5t-13-8.5L576-280q-13-13-18.5-28t-5.5-30q0-32 23-57t59-25q28 0 44 13t38 35q20-20 36.5-34t45.5-14q37 0 59.5 25.5T880-337q0 15-6 30t-18 27L744-168q-6 6-13 8.5t-15 2.5Zm-556-3q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v153q0 17-11.5 28.5T840-527q-17 0-28.5-11.5T800-567v-73H160v160h300q17 0 25 16t-3 31q-22 33-34 72t-12 81q0 19 2.5 37.5T446-207q5 17-5.5 32T413-160H160Z" /> : <path d="M160-240v-320 13-173 480Zm556 83q-8 0-15-2.5t-13-8.5L576-280q-13-13-18.5-28t-5.5-30q0-32 23-57t59-25q28 0 44 13t38 35q20-20 36.5-34t45.5-14q37 0 59.5 25.5T880-337q0 15-6 30t-18 27L744-168q-6 6-13 8.5t-15 2.5ZM160-640h640v-80H160v80Zm0 480q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v158q0 18-15.5 26.5t-32.5.5q-26-12-55.5-18.5T716-560q-57 0-107.5 21.5T520-480H160v240h263q17 0 28.5 11.5T463-200q0 17-11.5 28.5T423-160H160Z" />}</Icon>;
}
