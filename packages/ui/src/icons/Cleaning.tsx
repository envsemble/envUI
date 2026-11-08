// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconCleaning({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M480-720v-40l-75 75q-1 1-16 5-10 0-15.5-8.5T373-706l27-54v-40q-17 0-28.5-11.5T360-840q0-17 11.5-28.5T400-880h200q17 0 28.5 11.5T640-840v31q0 5-1 8.5t-3 8.5l-36 72H480ZM400-80q-33 0-56.5-23.5T320-160v-197q0-10 2-19.5t7-18.5l128-242q11-20 29.5-31.5T528-680h72q17 0 28.5 11.5T640-640v480q0 33-23.5 56.5T560-80H400Z" /> : <path d="M400-760v-40q-17 0-28.5-11.5T360-840q0-17 11.5-28.5T400-880h200q17 0 28.5 11.5T640-840v31q0 5-1 8.5t-3 8.5l-36 72H480v-40l-75 75q-1 1-16 5-10 0-15.5-8.5T373-706l27-54Zm0 680q-33 0-56.5-23.5T320-160v-197q0-10 2-19.5t7-18.5l128-242q11-20 29.5-31.5T528-680h72q17 0 28.5 11.5T640-640v480q0 33-23.5 56.5T560-80H400Zm0-80h160v-440h-32L400-356v196Zm0 0h160-160Z" />}</Icon>;
}
