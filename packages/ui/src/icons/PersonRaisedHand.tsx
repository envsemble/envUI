// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M120-40q-17 0-28.5-11.5T80-80q0-17 11.5-28.5T120-120h720q17 0 28.5 11.5T880-80q0 17-11.5 28.5T840-40H120Zm80-120q-17 0-28.5-11.5T160-200v-200q-33-54-51-114.5T91-638q0-61 15.5-120T143-874q8-21 26-33.5t40-12.5q31 0 53 21t18 50l-11 91q-6 48 8.5 91t43.5 75.5q29 32.5 70 52t89 19.5q60 0 120.5 12.5T706-472q45 23 69.5 58.5T800-326v126q0 17-11.5 28.5T760-160H";

export function IconPersonRaisedHand({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "400v-37q0-34 23-58.5t57-24.5h120q17 0 28.5-11.5T640-320q0-17-11.5-28.5T600-360H480q-67 0-113.5 48T320-197v37H200Zm280-400q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" : start + "200Zm40-80h480v-86q0-24-12-42.5T674-398q-41-20-95-31t-99-11q-66 0-122.5-27t-96-72.5Q222-585 202-644.5T190-768q-10 30-14.5 64t-4.5 66q0 58 20.5 111.5T240-422v182Zm240-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-720q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720q0 33 23.5 56.5T480-640ZM320-160v-37q0-67 46.5-115T480-360h120q17 0 28.5 11.5T640-320q0 17-11.5 28.5T600-280H480q-34 0-57 24.5T400-197v37h-80Zm160-80Zm0-480Z"} /></Icon>;
}
