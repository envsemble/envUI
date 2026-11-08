// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M480-760q-25 0-42.5-17.5T420-820q0-18 8-32t37-49q6-8 15-8t15 8q29 35 37 49t8 32q0 25-17.5 42.5T480-760Zm-200 0q-25 0-42.5-17.5T220-820q0-18 8-32t37-49q6-8 15-8t15 8q29 35 37 49t8 32q0 25-17.5 42.5T280-760Zm400 0q-25 0-42.5-17.5T620-820q0-18 8-32t37-49q6-8 15-8t15 8q29 35 37 49t8 32q0 25-17.5 42.5T680-760ZM240-120v20q0 25-17.5 42.5T180-40q-25 0-42.5-17.5T120-100v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-40q-25 0-42.5-17.5T720-100v-20H240Zm-8-360h496l-42-120H274l-42 120Zm";

export function IconLocalCarWash({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "68 240q25 0 42.5-17.5T360-300q0-25-17.5-42.5T300-360q-25 0-42.5 17.5T240-300q0 25 17.5 42.5T300-240Zm360 0q25 0 42.5-17.5T720-300q0-25-17.5-42.5T660-360q-25 0-42.5 17.5T600-300q0 25 17.5 42.5T660-240Z" : start + "-32 80v200-200Zm100 160q25 0 42.5-17.5T360-300q0-25-17.5-42.5T300-360q-25 0-42.5 17.5T240-300q0 25 17.5 42.5T300-240Zm360 0q25 0 42.5-17.5T720-300q0-25-17.5-42.5T660-360q-25 0-42.5 17.5T600-300q0 25 17.5 42.5T660-240Zm-460 40h560v-200H200v200Z"} /></Icon>;
}
