// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconAppSpark({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M740-560q-6 0-8-6-16-61-60.5-105.5T566-732q-6-2-6-8 0-7 6-8 61-16 105.5-60.5T732-914q2-6 8-6t8 6q16 61 60.5 105.5T914-748q6 1 6 8 0 6-6 8-61 16-105.5 60.5T748-566q-1 6-8 6Zm-60 440H280q-66 0-113-47t-47-113v-400q0-66 47-113t113-47h187q12 0 19 9.5t3 21.5q-18 67-1 134.5T556-556q51 51 118.5 68t134.5-1q12-3 21.5 3.5T840-467v187q0 66-47 113t-113 47Z" /> : <path d="M200-280v80-560 480Zm480 160H280q-66 0-113-47t-47-113v-400q0-66 47-113t113-47h161q17 0 28.5 11.5T481-800q0 17-11.5 28.5T441-760H280q-33 0-56.5 23.5T200-680v400q0 33 23.5 56.5T280-200h400q33 0 56.5-23.5T760-280v-161q0-17 11.5-28.5T800-481q17 0 28.5 11.5T840-441v161q0 66-47 113t-113 47Zm60-440q-6 0-8-6-16-61-60.5-105.5T566-732q-6-2-6-8 0-7 6-8 61-16 105.5-60.5T732-914q2-6 8-6t8 6q16 61 60.5 105.5T914-748q6 1 6 8 0 6-6 8-61 16-105.5 60.5T748-566q-1 6-8 6Z" />}</Icon>;
}
