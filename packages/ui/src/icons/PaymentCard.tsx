// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm";

export function PaymentCard({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "40-120h400L400-680H200v400Zm320-320h240v-80H520v80Z" : start + "0-80h640v-480H160v480Zm80-40h295q23 0 34.5-19t1.5-39L411-658q-5-11-15-16.5t-21-5.5H240q-17 0-28.5 11.5T200-640v320q0 17 11.5 28.5T240-280Zm320-320h160q17 0 28.5-11.5T760-640q0-17-11.5-28.5T720-680H560q-17 0-28.5 11.5T520-640q0 17 11.5 28.5T560-600ZM160-240v-480 480Z"} /></Icon>;
}
