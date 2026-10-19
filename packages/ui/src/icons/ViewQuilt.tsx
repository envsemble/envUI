// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ViewQuilt({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M453-500q-33 0-56.5-23.5T373-580v-100q0-33 23.5-56.5T453-760h307q33 0 56.5 23.5T840-680v100q0 33-23.5 56.5T760-500H453Zm254 300q-33 0-56.5-23.5T627-280v-100q0-33 23.5-56.5T707-460h53q33 0 56.5 23.5T840-380v100q0 33-23.5 56.5T760-200h-53Zm-254 0q-33 0-56.5-23.5T373-280v-100q0-33 23.5-56.5T453-460h54q33 0 56.5 23.5T587-380v100q0 33-23.5 56.5T507-200h-54Zm-253 0q-33 0-56.5-23.5T120-280v-400q0-33 23.5-56.5T200-760h53q33 0 56.5 23.5T333-680v400q0 33-23.5 56.5T253-200h-53Z" /> : <path d="M120-280v-400q0-33 23.5-56.5T200-760h560q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H200q-33 0-56.5-23.5T120-280Zm293-240h347v-160H413v160Zm214 240h133v-160H627v160Zm-214 0h134v-160H413v160Zm-213 0h133v-400H200v400Z" />}</Icon>;
}
