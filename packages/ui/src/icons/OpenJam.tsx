// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconOpenJam({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M280-120q-17 0-28.5-11.5T240-160q0-17 11.5-28.5T280-200h240v-288l36 36q11 11 28 11t28-11q11-11 11-28t-11-28L508-612q-12-12-28-12t-28 12L348-508q-11 11-11 28t11 28q11 11 28 11t28-11l36-36v168H160q-33 0-56.5-23.5T80-400v-360q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v360q0 33-23.5 56.5T800-320H600v120h80q17 0 28.5 11.5T720-160q0 17-11.5 28.5T680-120H280Z" /> : <path d="M440-200H280q-17 0-28.5 11.5T240-160q0 17 11.5 28.5T280-120h400q17 0 28.5-11.5T720-160q0-17-11.5-28.5T680-200H520v-288l36 36q11 11 28 11t28-11q11-11 11-28t-11-28L508-612q-12-12-28-12t-28 12L348-508q-11 11-11 28t11 28q11 11 28 11t28-11l36-36v288Zm40-280ZM160-320q-33 0-56.5-23.5T80-400v-360q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v360q0 33-23.5 56.5T800-320H640q-17 0-28.5-11.5T600-360q0-17 11.5-28.5T640-400h160v-360H160v360h160q17 0 28.5 11.5T360-360q0 17-11.5 28.5T320-320H160Z" />}</Icon>;
}
