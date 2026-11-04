// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

/** The path both styles start with. */
const start = "M480-411q-10 0-19.5-2.5T442-421L104-605q-11-6-15.5-15T84-640q0-11 4.5-20t15.5-15l338-184q9-5 18.5-7.5T480-869q10 0 19.5 2.5T518-859l338 184q11 6 15.5 15t4.5 20q0 11-4.5 20T856-605L518-421q-9 5-18.5 7.5T480-411Zm0";

export function IconStacks({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + " 80 314-171q2-1 19-5 17 0 28.5 11.5T853-467q0 11-5 20t-16 15L518-261q-9 5-18.5 7.5T480-251q-10 0-19.5-2.5T442-261L128-432q-11-6-16-15t-5-20q0-17 11.5-28.5T147-507q5 0 9.5 1.5t9.5 3.5l314 171Zm0 160 314-171q2-1 19-5 17 0 28.5 11.5T853-307q0 11-5 20t-16 15L518-101q-9 5-18.5 7.5T480-91q-10 0-19.5-2.5T442-101L128-272q-11-6-16-15t-5-20q0-17 11.5-28.5T147-347q5 0 9.5 1.5t9.5 3.5l314 171Z" : start + "-80 273-149-273-149-273 149 273 149Zm0-149Zm0 309 314-171q2-1 19-5 17 0 28.5 11.5T853-467q0 11-5 20t-16 15L518-261q-9 5-18.5 7.5T480-251q-10 0-19.5-2.5T442-261L128-432q-11-6-16-15t-5-20q0-17 11.5-28.5T147-507q5 0 9.5 1.5t9.5 3.5l314 171Zm0 160 314-171q2-1 19-5 17 0 28.5 11.5T853-307q0 11-5 20t-16 15L518-101q-9 5-18.5 7.5T480-91q-10 0-19.5-2.5T442-101L128-272q-11-6-16-15t-5-20q0-17 11.5-28.5T147-347q5 0 9.5 1.5t9.5 3.5l314 171Z"} /></Icon>;
}
