// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M89-53q-18 5-33.5-6.5T40-91q0-13 7.5-23T68-128l172-47v-105h-80q-17 0-28.5-11.5T120-320v-400q-17 0-28.5-11.5T80-760q0-17 11.5-28.5T120-800h80v-40q0-17 11.5-28.5T240-880h480q17 0 28.5 11.5T760-840v40h80q17 0 28.5 11.5T880-760q0 17-11.5 28.5T840-720v320q0 17-11.5 28.5T800-360h-80v55l151-42q18-5 33.5 6.5T920-309q0 13-7.5 23T892-272L89-53Zm271-154 240-66v-87h-80v40q0 17-11.5 28.5T480-280H360v73ZM200-";

export function IconFunicular({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "480h240v-240H200v240Zm320-80h240v-160H520v160Z" : start + "360h240v-40H200v40Zm320-80h240v-40H520v40Zm-320-40h240v-240H200v240Zm320-80h240v-160H520v160Zm-80 200v-40 40Zm80-80v-40 40Z"} /></Icon>;
}
