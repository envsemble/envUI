// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconAirplay({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M312-120q-14 0-22-9.5t-8-20.5q0-5 2-10.5t7-10.5l161-161q6-6 13-9t15-3q8 0 15 3t13 9l161 161q5 5 7 10.5t2 10.5q0 11-8 20.5t-22 9.5H312ZM160-840h640q33 0 56.5 23.5T880-760v480q0 33-23.5 56.5T800-200h-7q-16 0-30.5-6T737-223L565-395q-17-17-39-26t-46-9q-24 0-46 9t-39 26L223-223q-11 11-25.5 17t-30.5 6h-7q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840Z" /> : <path d="M80-280v-480q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v480q0 33-23.5 56.5T800-200h-80q-17 0-28.5-11.5T680-240q0-17 11.5-28.5T720-280h80v-480H160v480h80q17 0 28.5 11.5T280-240q0 17-11.5 28.5T240-200h-80q-33 0-56.5-23.5T80-280Zm232 160q-14 0-22-9.5t-8-20.5q0-5 2-10.5t7-10.5l161-161q6-6 13-9t15-3q8 0 15 3t13 9l161 161q5 5 7 10.5t2 10.5q0 11-8 20.5t-22 9.5H312Zm168-360Z" />}</Icon>;
}
