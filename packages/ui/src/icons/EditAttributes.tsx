// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M280-280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h400q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H280Zm";

export function IconEditAttributes({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "70-136 93-93q9-9 9-21t-9-21q-9-9-21-9t-21 9l-79 79-19-19q-9-9-21-9t-21 9q-9 9-9 21t9 21l33 33q12 12 28 12t28-12Z" : start + "0-80h400q50 0 85-35t35-85q0-50-35-85t-85-35H280q-50 0-85 35t-35 85q0 50 35 85t85 35Zm70-56 93-93q9-9 9-21t-9-21q-9-9-21-9t-21 9l-79 79-19-19q-9-9-21-9t-21 9q-9 9-9 21t9 21l33 33q12 12 28 12t28-12Zm130-64Z"} /></Icon>;
}
