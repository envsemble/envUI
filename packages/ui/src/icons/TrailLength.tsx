// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

/** The path both styles start with. */
const start = "M320-280q-17 0-28.5-11.5T280-320q0-17 11.5-28.5T320-360h200q-14-17-22.5-37T484-440h-84q-17 0-28.5-11.5T360-480q0-17 11.5-28.5T400-520h84q5-23 13.5-43t22.5-37H160q-17 0-28.5-11.5T120-640q0-17 11.5-28.5T160-680h520q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H320Z";

export function IconTrailLength({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "M120-440q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h160q17 0 28.5 11.5T320-480q0 17-11.5 28.5T280-440H120Zm40 160q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360h40q17 0 28.5 11.5T240-320q0 17-11.5 28.5T200-280h-40Z" : start + "m360-80q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm-560-80q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h160q17 0 28.5 11.5T320-480q0 17-11.5 28.5T280-440H120Zm40 160q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360h40q17 0 28.5 11.5T240-320q0 17-11.5 28.5T200-280h-40Zm520-200Z"} /></Icon>;
}
