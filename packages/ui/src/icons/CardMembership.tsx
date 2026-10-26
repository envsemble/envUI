// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function CardMembership({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M160-880h640q33 0 56.5 23.5T880-800v440q0 33-23.5 56.5T800-280H640v135q0 23-19 34.5t-39 1.5l-84-42q-8-5-18-5t-18 5l-84 42q-20 10-39-1.5T320-145v-135H160q-33 0-56.5-23.5T80-360v-440q0-33 23.5-56.5T160-880Zm0 440h640v-120H160v120Z" /> : <path d="M160-440v80h640v-80H160Zm0-440h640q33 0 56.5 23.5T880-800v440q0 33-23.5 56.5T800-280H640v135q0 23-19 34.5t-39 1.5l-84-42q-8-5-18-5t-18 5l-84 42q-20 10-39-1.5T320-145v-135H160q-33 0-56.5-23.5T80-360v-440q0-33 23.5-56.5T160-880Zm0 320h640v-240H160v240Zm0 200v-440 440Z" />}</Icon>;
}
