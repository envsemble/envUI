// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconStackedEmail({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M537-484q11 8 23 8t23-8l257-179v-97L560-566 280-760v97l257 179ZM120-120q-33 0-56.5-23.5T40-200v-460q0-17 11.5-28.5T80-700q17 0 28.5 11.5T120-660v460h620q17 0 28.5 11.5T780-160q0 17-11.5 28.5T740-120H120Zm160-160q-33 0-56.5-23.5T200-360v-400q0-33 23.5-56.5T280-840h560q33 0 56.5 23.5T920-760v400q0 33-23.5 56.5T840-280H280Z" /> : <path d="M280-280q-33 0-56.5-23.5T200-360v-400q0-33 23.5-56.5T280-840h560q33 0 56.5 23.5T920-760v400q0 33-23.5 56.5T840-280H280Zm257-204L280-663v303h560v-303L583-484q-11 8-23 8t-23-8Zm23-82 280-194H280l280 194ZM120-120q-33 0-56.5-23.5T40-200v-460q0-17 11.5-28.5T80-700q17 0 28.5 11.5T120-660v460h620q17 0 28.5 11.5T780-160q0 17-11.5 28.5T740-120H120Zm720-546v-94H280v94-94h560v94Z" />}</Icon>;
}
