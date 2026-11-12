// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "M470-200h-10q-142 0-241-99t-99-241q0-142 99-241t241-99q71 0 132.5 26.5t108 73q46.5 46.5 73 108T800-540q0 134-75.5 249T534-111q-10 5-20 5.5t-18-4.5q-8-5-14-13t-7-19l-5-58Zm";

export function IconContactSupport({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "-11-121q17 0 29-12t12-29q0-17-12-29t-29-12q-17 0-29 12t-12 29q0 17 12 29t29 12Zm-87-304q11 5 22 .5t18-14.5q9-12 21-18.5t27-6.5q24 0 39 13.5t15 34.5q0 13-7.5 26T480-558q-25 22-37 41.5T431-477q0 12 8.5 20.5T460-448q12 0 20-9t12-21q5-17 18-31t24-25q21-21 31.5-42t10.5-42q0-46-31.5-74T460-720q-32 0-59 15.5T357-662q-6 11-1.5 21.5T372-625Z" : start + "90-26q71-60 115.5-140.5T720-540q0-109-75.5-184.5T460-800q-109 0-184.5 75.5T200-540q0 109 75.5 184.5T460-280h100v54Zm-101-95q17 0 29-12t12-29q0-17-12-29t-29-12q-17 0-29 12t-12 29q0 17 12 29t29 12Zm-87-304q11 5 22 .5t18-14.5q9-12 21-18.5t27-6.5q24 0 39 13.5t15 34.5q0 13-7.5 26T480-558q-25 22-37 41.5T431-477q0 12 8.5 20.5T460-448q12 0 20-9t12-21q5-17 18-31t24-25q21-21 31.5-42t10.5-42q0-46-31.5-74T460-720q-32 0-59 15.5T357-662q-6 11-1.5 21.5T372-625Zm88 112Z"} /></Icon>;
}
