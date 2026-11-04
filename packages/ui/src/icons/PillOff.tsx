// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconPillOff({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M840-615q0 45-17 86t-49 73l-52 52q-12 12-28 12t-28-12L404-666q-12-12-12-28t12-28l52-52q32-32 73-49t86-17q94 0 159.5 65.5T840-615ZM581-263l-77 77q-32 32-73 49t-86 17q-94 0-159.5-65.5T120-345q0-45 17-86t49-73l77-77L84-760q-11-11-11-28t11-28q11-11 28-11t28 11l680 680q11 11 11 28t-11 28q-11 11-28 11t-28-11L581-263Z" /> : <path d="M840-615q0 45-17 86t-49 73l-52 52q-11 11-28 11t-28-11q-11-11-11-28t11-28l52-52q20-20 31-47t11-56q0-60-42.5-102.5T615-760q-29 0-56 11t-47 31l-52 52q-11 11-28 11t-28-11q-11-11-11-28t11-28l52-52q32-32 73-49t86-17q94 0 159.5 65.5T840-615ZM345-200q29 0 56-11t47-31l77-77-206-206-77 77q-20 20-31 47t-11 56q0 60 42.5 102.5T345-200Zm236-63-77 77q-32 32-73 49t-86 17q-94 0-159.5-65.5T120-345q0-45 17-86t49-73l77-77L84-760q-11-11-11-28t11-28q11-11 28-11t28 11l680 680q11 11 11 28t-11 28q-11 11-28 11t-28-11L581-263ZM422-422Zm113-113Z" />}</Icon>;
}
