// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-60q-13 0-25-4t-23-12L192-256q-15-11-23.5-28t-8.5-36v-480q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v480q0 19-8.5 36T768-256L528-76q-11 8-23 12t-25 4Zm";

export function IconBeenhere({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-42-414-56-56q-12-12-28-11.5T326-530q-12 12-12.5 28.5T325-473l85 85q12 12 28 12t28-12l170-170q12-12 11.5-28T636-614q-12-12-28.5-12.5T579-615L438-474Z" : start + "0-80 240-180v-480H240v480l240 180Zm-42-334-56-56q-12-12-28-11.5T326-530q-12 12-12.5 28.5T325-473l85 85q12 12 28 12t28-12l170-170q12-12 11.5-28T636-614q-12-12-28.5-12.5T579-615L438-474Zm42-326H240h480-240Z"} /></Icon>;
}
