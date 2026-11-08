// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconWatchButton({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M235-159q-5 15-10.5 30T213-100q-6 15-21.5 20T162-83q-14-8-20-23t0-30q34-81 45.5-168T199-480q0-88-11-174t-45-167q-7-16-1.5-31.5T162-876q15-8 30.5-2.5T214-858q6 14 11 29t10 29h85q66 1 113 47.5T480-639v320q0 66-47 113t-113 47h-85Zm478-281 36 36q11 11 11 27.5T748-348q-11 11-28 11t-28-11L588-452q-12-12-12-28t12-28l104-104q12-12 28-11.5t28 12.5q11 12 11.5 28T748-555l-35 35h127q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H713Z" /> : <path d="M235-159q-5 15-10.5 30T213-100q-6 15-21.5 20T162-83q-14-8-20.5-23t.5-30q35-81 46.5-168T200-480q0-88-11.5-174T143-821q-7-16-1.5-31.5T162-876q15-8 30.5-2.5T214-858q6 14 11 29t10 29h85q66 1 113 47.5T480-639v320q0 66-47 113t-113 47h-85Zm478-281 36 36q11 11 11 27.5T748-348q-11 11-28 11t-28-11L588-452q-12-12-12-28t12-28l104-104q12-12 28-11.5t28 12.5q11 12 11.5 28T748-555l-35 35h127q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H713ZM257-239h63q33 0 56.5-24t23.5-57v-320q0-33-23.5-56.5T320-720h-64q13 59 18.5 119.5T280-480q0 61-5 121.5T257-239Zm23-241Z" />}</Icon>;
}
