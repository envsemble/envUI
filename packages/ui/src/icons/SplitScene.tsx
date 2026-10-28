// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h160q17 0 28.5 11.5T360-760";

export function SplitScene({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "v560q0 17-11.5 28.5T320-160H160Zm320 80q-17 0-28.5-11.5T440-120v-720q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840v40h280q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H520v40q0 17-11.5 28.5T480-80Z" : start + "q0 17-11.5 28.5T320-720H160v480h160q17 0 28.5 11.5T360-200q0 17-11.5 28.5T320-160H160Zm320 80q-17 0-28.5-11.5T440-120v-720q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840v40h280q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H520v40q0 17-11.5 28.5T480-80Zm40-160h280v-480H520v480Zm-360 0v-480 480Zm640 0v-480 480Z"} /></Icon>;
}
