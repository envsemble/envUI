// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconImageArrowUp({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h295q20 0 30.5 16.5T529-788q-5 17-7 34t-2 34q0 100 70 170t170 70q8 0 17-.5t17-2.5q18-2 32 9t14 28v246q0 33-23.5 56.5T760-120H200Zm80-160h400q12 0 18-11t-2-21L586-459q-6-8-16-8t-16 8L450-320l-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11Zm480-280q-17 0-28.5-11.5T720-600v-127l-36 35q-11 11-27.5 11.5T628-692q-11-11-11-28t11-28l104-104q6-6 13-9t15-3q8 0 15 3t13 9l104 104q11 11 11.5 27.5T892-692q-11 11-28 11t-28-11l-36-35v127q0 17-11.5 28.5T760-560Z" /> : <path d="M480-480ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280q17 0 28.5 11.5T520-800q0 17-11.5 28.5T480-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm520-607-36 35q-11 11-27.5 11.5T628-692q-11-11-11-28t11-28l104-104q6-6 13-9t15-3q8 0 15 3t13 9l104 104q11 11 11.5 27.5T892-692q-11 11-28 11t-28-11l-36-35v127q0 17-11.5 28.5T760-560q-17 0-28.5-11.5T720-600v-127ZM280-280h400q12 0 18-11t-2-21L586-459q-6-8-16-8t-16 8L450-320l-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11Z" />}</Icon>;
}
