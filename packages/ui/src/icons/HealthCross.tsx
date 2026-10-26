// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function HealthCross({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M360-120q-17 0-28.5-11.5T320-160v-160H160q-17 0-28.5-11.5T120-360v-240q0-17 11.5-28.5T160-640h160v-160q0-17 11.5-28.5T360-840h240q17 0 28.5 11.5T640-800v160h160q17 0 28.5 11.5T840-600v240q0 17-11.5 28.5T800-320H640v160q0 17-11.5 28.5T600-120H360Z" /> : <path d="M360-120q-17 0-28.5-11.5T320-160v-160H160q-17 0-28.5-11.5T120-360v-240q0-17 11.5-28.5T160-640h160v-160q0-17 11.5-28.5T360-840h240q17 0 28.5 11.5T640-800v160h160q17 0 28.5 11.5T840-600v240q0 17-11.5 28.5T800-320H640v160q0 17-11.5 28.5T600-120H360Zm40-80h160v-200h200v-160H560v-200H400v200H200v160h200v200Zm80-280Z" />}</Icon>;
}
