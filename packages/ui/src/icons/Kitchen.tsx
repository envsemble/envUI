// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

export function IconKitchen({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M360-640q17 0 28.5-11.5T400-680v-40q0-17-11.5-28.5T360-760q-17 0-28.5 11.5T320-720v40q0 17 11.5 28.5T360-640Zm0 360q17 0 28.5-11.5T400-320v-120q0-17-11.5-28.5T360-480q-17 0-28.5 11.5T320-440v120q0 17 11.5 28.5T360-280ZM240-80q-33 0-56.5-23.5T160-160v-360h640v360q0 33-23.5 56.5T720-80H240Zm-80-520v-200q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v200H160Z" /> : <path d="M360-640q-17 0-28.5-11.5T320-680v-40q0-17 11.5-28.5T360-760q17 0 28.5 11.5T400-720v40q0 17-11.5 28.5T360-640Zm0 360q-17 0-28.5-11.5T320-320v-120q0-17 11.5-28.5T360-480q17 0 28.5 11.5T400-440v120q0 17-11.5 28.5T360-280ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-360H240v360Zm0-440h480v-200H240v200Z" />}</Icon>;
}
