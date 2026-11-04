// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconMarkEmailUnread({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M760-640q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h364q16 0 26.5 12t9.5 28q0 11 1 20.5t3 19.5q7 32 23 59.5t39 48.5l-146 92-268-168q-17-11-34.5-1T160-659q0 9 4 16.5t12 12.5l283 177q10 6 21 6t21-6l190-119q17 6 34 9t35 3q18 0 36-3t35-10q17-7 33 2t16 26v305q0 33-23.5 56.5T800-160H160Z" /> : <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h360q17 0 28.5 11.5T560-760q0 17-11.5 28.5T520-720H160v480h640v-280q0-17 11.5-28.5T840-560q17 0 28.5 11.5T880-520v280q0 33-23.5 56.5T800-160H160Zm0-560v480-480Zm320 200 129-80q14-9 26.5-4.5T655-589q7 11 5 24t-16 22l-143 90q-10 6-21 6t-21-6L160-640v-80l320 200Zm280-120q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" />}</Icon>;
}
