// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function LineEndDiamond({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M572-228 360-440H120q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h240l212-212q12-12 28-12t28 12l224 224q12 12 12 28t-12 28L628-228q-12 12-28 12t-28-12Z" /> : <path d="m600-313 167-167-167-167-167 167 167 167Zm-28 85L360-440H120q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h240l212-212q12-12 28-12t28 12l224 224q12 12 12 28t-12 28L628-228q-12 12-28 12t-28-12Zm28-252Z" />}</Icon>;
}
