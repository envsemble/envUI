// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M200-120q-33 0-56.5-23.5T120-200v-500q0-14 4.5-26.5T138-750l56-68q9-11 20.5-16.5T240-840h480q14 0 25.5 5.5T766-818l56 68q9 11 13.5 23.5T840-700v500q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm";

export function IconSdk({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "392 300-55 55q-12 12-12 29t12 29q12 12 29 12t29-12l85-85q12-12 12-28t-12-28l-85-85q-12-12-29-12t-29 12q-12 12-12 29t12 29l55 55Zm-254 0 55-55q12-12 12-29t-12-29q-12-12-29-12t-29 12l-85 85q-12 12-12 28t12 28l85 85q12 12 29 12t29-12q12-12 12-29t-12-29l-55-55Z" : start + "-16 520h560v-440H200v440Zm408-220-55 55q-12 12-12 29t12 29q12 12 29 12t29-12l85-85q12-12 12-28t-12-28l-85-85q-12-12-29-12t-29 12q-12 12-12 29t12 29l55 55Zm-254 0 55-55q12-12 12-29t-12-29q-12-12-29-12t-29 12l-85 85q-12 12-12 28t12 28l85 85q12 12 29 12t29-12q12-12 12-29t-12-29l-55-55ZM200-200v-440 440Z"} /></Icon>;
}
