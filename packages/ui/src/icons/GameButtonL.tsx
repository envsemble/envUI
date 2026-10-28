// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M80-240v-400q0-66 47-113t113-47h480q66 0 113 47t47 113v400q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240Zm";

export function GameButtonL({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "398-151v-202q0-11-8-19t-19-8q-11 0-19.5 8t-8.5 19v214q0 17 11.5 28.5T463-339h108q11 0 18.5-7.5T597-365q0-11-7.5-18.5T571-391h-93Z" : start + "80 0h640v-400q0-33-23.5-56.5T720-720H240q-33 0-56.5 23.5T160-640v400Zm0 0h640-640Zm318-151v-202q0-11-8-19t-19-8q-11 0-19.5 8t-8.5 19v214q0 17 11.5 28.5T463-339h108q11 0 18.5-7.5T597-365q0-11-7.5-18.5T571-391h-93Z"} /></Icon>;
}
