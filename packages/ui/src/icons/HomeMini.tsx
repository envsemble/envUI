// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function HomeMini({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M480-760q76 0 148 18.5t128 54q56 35.5 90 87.5t34 120H80q0-68 34-120t90-87.5q56-35.5 128-54T480-760ZM360-200q-94 0-167.5-55.5T92-400h776q-27 89-100.5 144.5T600-200H360Z" /> : <path d="M360-200q-116 0-198-82T80-480q0-38 18.5-86t64.5-91.5q46-43.5 123-73T480-760q117 0 194 29.5t123 73q46 43.5 64.5 91.5t18.5 86q0 116-82 198t-198 82H360Zm6-80h228q63 0 114.5-33.5T784-400H176q24 53 75.5 86.5T366-280Zm114-120Zm0-40Zm-320-40h640q0-30-16-65t-53.5-65q-37.5-30-99-50T480-680q-90 0-151 20t-98.5 50q-37.5 30-54 65T160-480Zm320 0Z" />}</Icon>;
}
