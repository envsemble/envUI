// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M160 0q-33 0-56.5-23.5T80-80q0-33 23.5-56.5T160-160h640q33 0 56.5 23.5T880-80q0 33-23.5 56.5T800 0H160Zm";

export function IconFormatInkHighlighter({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "264-640 216 217-160 160q-24 24-56.5 24T367-263l-5 4q-11 9-24 14t-27 5H189q-14 0-19.5-12t4.5-22l92-91q-24-24-25-57.5t23-57.5l160-160Zm56-57 160-159q24-24 56.5-24t56.5 24l104 103q24 24 24 56.5T857-640L697-480 480-697Z" : start + "424-480L480-584 320-424l103 104 161-160Zm-47-160 103 103 160-159-104-104-159 160Zm-84-29 216 216-189 190q-24 24-56.5 24T367-263l-5 4q-11 9-24 14t-27 5H189q-14 0-19.5-12t4.5-22l92-91q-24-24-25-57.5t23-57.5l189-189Zm0 0 187-187q24-24 56.5-24t56.5 24l104 103q24 24 24 56.5T857-640L669-453 453-669Z"} /></Icon>;
}
