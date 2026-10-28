// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M440-120v-40q0-17 11.5-28.5T480-200q17 0 28.5 11.5T520-160v40q0 17-11.5 28.5T480-80q-17 0-28.5-11.5T440-120ZM120-520h40q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440h-40q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520Zm680 0h40q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440h-40q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520ZM692-192l-28-28q-11-11-11-28t11-28q11-11 28-11t28 11l28 28q11 11 11 28t-11 28q-11 11-28 11t-28-11Zm-480-56 28-28q11-11 28-11t28 11q11 11 11 28t-11 28l-28 28q-11 11-28 11t-28-11q-11-11-11-28t11-28Zm268-32q-83 0-141.5-58.5T280-480q0-48 21.5-89.5T360-640v-120q0-33 23.5-56.5T440-840h80q33 0 56.5 23.5T600-760v120q37 29 58.5 70.5T680-480q0 83-58.5 141.5T480-280Zm-40-396q10-2 20-3t20-1q10 0 20 1t20 3v-84h-80v84Zm40 316q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0";

export function WbIncandescent({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + " 0q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" : start + "-120Z"} /></Icon>;
}
