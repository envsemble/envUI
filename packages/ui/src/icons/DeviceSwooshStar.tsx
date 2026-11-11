// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

/** The path both styles start with. */
const start = "m730-621-74 38q-11 6-21-1.5t-8-19.5l14-80q1-5-.5-10t-5.5-8l-60-57q-9-9-5.5-20.5T586-793l83-12q4-1 15-11l38-73q6-11 18.5-11t17.5 11l37 73q1 3 15 11l82 12q13 2 17 13.5t-5 20.5l-60 57q-2 2-6 18l14 80q2 12-8.5 19.5T822-583l-73-38q-2-1-19 0ZM";

export function IconDeviceSwooshStar({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "122-281q-38 0-60-21t-22-58q0-67 54.5-144T200-632v-48q0-66 47-113t113-47h140q-11 24-15.5 49t-4.5 51q0 60 24.5 111t66.5 87q-60 47-105 81t-81.5 59q-36.5 25-67 43.5T255-324q-29 15-65 29t-68 14Zm238 161q-51 0-90.5-27.5T212-218q19-7 37-15.5t36-17.5q36-19 73-41t79-51q42-29 92-67t114-88q28 11 57.5 15.5T760-480v200q0 66-47 113t-113 47H360ZM120-360q20 0 40-4t40-11v-119q-32 35-51.5 67.5T120-360Z" : start + "480-480Zm120 360H360q-50 0-90-27.5T212-219q19-7 37-15.5t36-17.5q9 23 29 37.5t46 14.5h240q33 0 56.5-23.5T680-280v-199h80v199q0 66-47 113t-113 47ZM480-480ZM122-282q-38 0-59.5-21T41-361q0-66 54-143t105-128v-48q0-66 47-113t113-47h121v80H360q-33 0-56.5 23.5T280-680v270q72-38 138-78.5T548-576q9-6 16.5-4.5T577-573q5 6 4.5 14t-8.5 15q-71 57-142.5 109.5T280-339q-35 19-77 38t-81 19Zm-2-78q20 0 40-4t40-11v-119q-32 35-51.5 67.5T120-360Z"} /></Icon>;
}
