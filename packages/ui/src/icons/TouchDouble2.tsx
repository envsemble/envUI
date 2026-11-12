// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M418-80q-28 0-52-10.5T325-123L128-374q-9-12-8-27.5t12-26.5q17-17 42.5-20t47.5 10l78 47v-249q0-17 11.5-28.5T340-680q17 0 28.5 11.5T380-640v";

export function IconTouchDouble2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "160h60v-230q0-17 11.5-28.5T480-750q17 0 28.5 11.5T520-710v230h160q50 0 85 35t35 85v120q0 67-47 113.5T640-80H418Zm2-760q-42 0-78.5 16T278-781q-26 26-41.5 61T219-648q-1 17-10.5 30.5T182-602q-17 2-31-7.5T137-636q-1-52 24-109t61-93q38-38 89-60t109-22q58 0 109 22t89 60q41 41 61 91t20 107q0 17-12.5 27t-29.5 8q-17-2-27-14.5T619-649q-2-38-16.5-71.5T561-781q-27-27-63-43t-78-16Z" : start + "322q0 23-20.5 34.5T319-284l-37-23 105 133q5 8 13.5 11t17.5 3h222q33 0 56.5-23t23.5-57v-160q0-17-11.5-28.5T680-440h-60q-17 0-28.5-11.5T580-480q0-17 11.5-28.5T620-520h60q50 0 85 35t35 85v160q0 67-47 113.5T640-80H418Zm33.5-371.5Q440-463 440-480v-230q0-17 11.5-28.5T480-750q17 0 28.5 11.5T520-710v230q0 17-11.5 28.5T480-440q-17 0-28.5-11.5ZM420-840q-42 0-78.5 16T278-781q-26 26-41.5 61T219-648q-1 17-10.5 30.5T182-602q-17 2-31-7.5T137-636q-1-52 24-109t61-93q38-38 89-60t109-22q58 0 109 22t89 60q41 41 61 91t20 107q0 17-12.5 27t-29.5 8q-17-2-27-14.5T619-649q-2-38-16.5-71.5T561-781q-27-27-63-43t-78-16Zm81 520Z"} /></Icon>;
}
