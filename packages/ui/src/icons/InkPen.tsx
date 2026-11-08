// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconInkPen({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M611-461 461-612l111-110-29-29-191 191q-12 12-28 12t-28-12q-12-12-12-28.5t12-28.5l190-190q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L611-461ZM160-120q-17 0-28.5-11.5T120-160v-77q0-16 6-30.5t17-25.5l261-262 151 150-262 262q-11 11-25.5 17t-30.5 6h-77Z" /> : <path d="m490-527 37 37 217-217-37-37-217 217ZM200-200h37l233-233-37-37-233 233v37Zm355-205L405-555l167-167-29-29-191 191q-12 12-28 12t-28-12q-12-12-12-28.5t12-28.5l190-190q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L555-405ZM160-120q-17 0-28.5-11.5T120-160v-77q0-16 6-30.5t17-25.5l262-262 150 150-262 262q-11 11-25.5 17t-30.5 6h-77Z" />}</Icon>;
}
