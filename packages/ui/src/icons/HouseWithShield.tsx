// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function HouseWithShield({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M240-120q-33 0-56.5-23.5T160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H240Zm80-338q0 66 38 128t103 84q5 2 9.5 2.5t9.5.5q5 0 9.5-.5t9.5-2.5q65-22 103-84t38-128v-65q0-17-9-31.5T607-577l-100-50q-13-6-27-6t-27 6l-100 50q-15 8-24 22.5t-9 31.5v65Z" /> : <path d="M320-458q0 66 38 128t103 84q5 2 9.5 2.5t9.5.5q5 0 9.5-.5t9.5-2.5q65-22 103-84t38-128v-65q0-17-9-31.5T607-577l-100-50q-13-6-27-6t-27 6l-100 50q-15 8-24 22.5t-9 31.5v65Zm-80 338q-33 0-56.5-23.5T160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H240Zm0-80h480v-360L480-740 240-560v360Zm240-270Z" />}</Icon>;
}
