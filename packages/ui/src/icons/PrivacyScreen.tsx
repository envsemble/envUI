// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function PrivacyScreen({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 96 960 960" {...props}>{filled ? <path d="m80 560 304-304H160q-33 0-56.5 23.5T80 336v224Zm0 280 583-584H496L80 673v167Zm56 56h664q33 0 56.5-23.5T880 816V336q0-33-23.5-56.5T800 256h-24L136 896Z" /> : <path d="m160 480 144-144H160v144Zm0 280 423-424H416L160 593v167Zm56 56h584V336H696L216 816Zm-56 80q-33 0-56.5-23.5T80 816V336q0-33 23.5-56.5T160 256h640q33 0 56.5 23.5T880 336v480q0 33-23.5 56.5T800 896H160Z" />}</Icon>;
}
