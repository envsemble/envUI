// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M360-80v-80H227q-20 0-28-18t5-32l246-276q12-14 30-14t30 14l246 276q13 14 5 32t-28 18H600v80q0 17-11.5 28.5T560-40H400q-17 0-28.5-11.5T360-80Zm";

export function IconArrowShapeUpStack2({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "120-520L279-373q-6 6-14 9.5t-16 3.5q-26 0-36.5-23t6.5-43l231-260q12-14 30-14t30 14l231 260q17 20 6.5 43T711-360q-8 0-16-3t-14-10L480-600Zm0-200L279-573q-6 6-14 9.5t-16 3.5q-26 0-36.5-23t6.5-43l231-260q12-14 30-14t30 14l231 260q17 20 6.5 43T711-560q-8 0-16-3t-14-10L480-800Z" : start + "80-40h80v-80q0-17 11.5-28.5T560-240h62L480-400 338-240h62q17 0 28.5 11.5T440-200v80Zm40-480L279-373q-6 6-14 9.5t-16 3.5q-26 0-36.5-23t6.5-43l231-260q12-14 30-14t30 14l231 260q17 20 6.5 43T711-360q-8 0-16-3t-14-10L480-600Zm0-200L279-573q-6 6-14 9.5t-16 3.5q-26 0-36.5-23t6.5-43l231-260q12-14 30-14t30 14l231 260q17 20 6.5 43T711-560q-8 0-16-3t-14-10L480-800Zm0 560Z"} /></Icon>;
}
