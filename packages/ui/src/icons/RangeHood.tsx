// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function RangeHood({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M194-480q-20 0-28-18.5t6-32.5l108-109v-120q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760v120l109 109q14 14 6.5 32.5T768-480H194Zm-34 320q-33 0-56.5-23.5T80-240v-120q0-17 11.5-28.5T120-400h720q17 0 28.5 11.5T880-360v120q0 33-23.5 56.5T800-160H160Zm270-132h100q13 0 21.5-8.5T560-322q0-13-8.5-21.5T530-352H430q-13 0-21.5 8.5T400-322q0 13 8.5 21.5T430-292Z" /> : <path d="M160-160q-33 0-56.5-23.5T80-240v-168q0-16 6.5-30.5T104-464l176-176v-120q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760v120l177 177q11 11 17 25.5t6 30.5v167q0 33-23.5 56.5T800-160H160Zm320-600H360v119q0 16-6 30.5T337-585L232-480h496L623-585q-11-11-17-25.5t-6-30.5v-119H480ZM160-240h640v-160H160v160Zm270-52q-13 0-21.5-8.5T400-322q0-13 8.5-21.5T430-352h100q13 0 21.5 8.5T560-322q0 13-8.5 21.5T530-292H430Z" />}</Icon>;
}
