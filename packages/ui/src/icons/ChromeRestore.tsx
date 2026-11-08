// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M400 736q-33 0-56.5-23.5T320 656V336q0-33 23.5-56.5T400 256h320q33 0 56.5 23.5T800 336v320q0 33-23.5 56.5T720 736H400Z";

export function IconChromeRestore({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 96 960 960" {...props}><path d={filled ? start + "M240 896q-33 0-56.5-23.5T160 816V477q0-17 11.5-28.5T200 437q17 0 28.5 11.5T240 477v339h339q17 0 28.5 11.5T619 856q0 17-11.5 28.5T579 896H240Z" : start + "m0-400v320h320V336H400ZM240 896q-33 0-56.5-23.5T160 816V477q0-17 11.5-28.5T200 437q17 0 28.5 11.5T240 477v339h339q17 0 28.5 11.5T619 856q0 17-11.5 28.5T579 896H240Zm160-560v320-320Z"} /></Icon>;
}
