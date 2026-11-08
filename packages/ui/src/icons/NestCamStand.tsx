// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconNestCamStand({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M240-120q-35 0-59-26.5T160-208l24-280q5-72 42-131t94-95v154q0 66 47 113t113 47q67 0 113.5-47T640-560v-154q57 36 94 95t42 131l24 284q3 35-21 59.5T720-120H240Zm240-360q-33 0-56.5-23.5T400-560v-160q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720v160q0 33-23.5 56.5T480-480Z" /> : <path d="M360-643q-40 27-65.5 69.5T264-480l-24 280h480l-24-280q-4-52-29.5-94.5T600-644v84q0 50-35 85t-85 35q-50 0-85-35t-35-85v-83Zm120 123q17 0 28.5-11.5T520-560v-160q0-17-11.5-28.5T480-760q-17 0-28.5 11.5T440-720v160q0 17 11.5 28.5T480-520ZM240-120q-35 0-59-26t-21-61l24-281q7-85 55-150t122-97q6-45 39.5-75t79.5-30q46 0 79.5 29.5T599-736q74 32 122.5 97.5T776-488l24 281q3 35-21 61t-59 26H240Z" />}</Icon>;
}
