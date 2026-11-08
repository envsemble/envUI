// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/SymbolIconFill.js';

export function IconKeyVertical({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M480-560q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm1 505q-8 0-15-2.5T453-65l-103-90q-6-5-9.5-11.5T336-181q-1-8 1.5-15.5T345-210l55-70-52-52q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l52-52v-14q-72-25-116-87t-44-139q0-100 70-170t170-70q100 0 170 70t70 170q0 81-46 141.5T560-454v318q0 8-3 15.5t-9 13.5l-41 41q-5 5-11.5 8T481-55Z" /> : <path d="M420-680q0-33 23.5-56.5T500-760q33 0 56.5 23.5T580-680q0 33-23.5 56.5T500-600q-33 0-56.5-23.5T420-680Zm-160 0q0-100 70-170t170-70q100 0 170 70t70 170q0 67-33 121.5T620-472v335q0 8-3 15.5t-9 13.5l-80 80q-6 6-13 8.5T500-17q-8 0-15-2.5T472-28L345-155q-5-5-8-12t-4-14q-1-7 1-14t7-13l39-52-43-57q-4-5-6-11t-2-12q0-6 2-12.5t6-11.5l43-61v-47q-54-32-87-86.5T260-680Zm80 0q0 56 34 98.5t86 56.5v125l-41 58h-.5.5l61 82-55 71 75 75v-.5.5l40-40h.5-.5v-371q52-14 86-56.5t34-98.5q0-66-47-113t-113-47q-66 0-113 47t-47 113Z" />}</Icon>;
}
