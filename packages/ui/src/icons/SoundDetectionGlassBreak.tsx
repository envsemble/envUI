// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconSoundDetectionGlassBreak({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M120-320v-440q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v2L540-421 437-524q-12-12-27-18t-30-6q-16 0-30.5 6T323-524L120-320Zm80 200q-33 0-56.5-23.5T120-200l260-261 100 100q12 12 27 17.5t30 5.5q17 0 32-6t27-20l244-274v438q0 33-23.5 56.5T760-120H200Z" /> : <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm180-428q15 0 30 6t27 18l103 103 220-247v-92H200v360l123-124q12-12 26.5-18t30.5-6Zm157 210q-15 0-30-5.5T480-361L380-461 200-280v80h560v-348L596-364q-12 14-27 20t-32 6Z" />}</Icon>;
}
