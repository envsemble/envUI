// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconMarkChatUnread({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M760-720q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM240-240l-92 92q-19 19-43.5 8.5T80-177v-623q0-33 23.5-56.5T160-880h364q16 0 26.5 12t9.5 28q0 45 19.5 85t54.5 69q26 21 58.5 33.5T760-640q18 0 36-3t35-10q17-7 33 2t16 26v305q0 33-23.5 56.5T800-240H240Z" /> : <path d="m240-240-92 92q-19 19-43.5 8.5T80-177v-623q0-33 23.5-56.5T160-880h360q17 0 28.5 11.5T560-840q0 17-11.5 28.5T520-800H160v525l46-45h594v-280q0-17 11.5-28.5T840-640q17 0 28.5 11.5T880-600v280q0 33-23.5 56.5T800-240H240Zm520-480q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm-600-80v480-480Z" />}</Icon>;
}
