// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function Circles({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M680-920q100 0 170 70t70 170q0 100-70 170t-170 70q-100 0-170-70t-70-170q0-100 70-170t170-70ZM185-185q-51-51-78-117T80-440q0-106 56-193t152-132q29-12 54 5t20 45q-8 73 17 141.5T456-453q51 51 119 75.5T715-361q28-3 45 19t7 49q-44 97-132 155T440-80q-72 0-138-27t-117-78Z" /> : <path d="M440-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T80-440q0-97 47-180t131-129q22-12 45-2.5t34 33.5q10 22 0 44t-31 35q-52 31-79 85t-27 114q0 100 70 170t170 70q60 0 115-26.5t84-79.5q12-22 33.5-34t44.5-4q26 9 37 32t0 46q-45 88-130 137T440-80Zm240-840q100 0 170 70t70 170q0 100-70 170t-170 70q-100 0-170-70t-70-170q0-100 70-170t170-70Zm0 360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0-120ZM433-433Z" />}</Icon>;
}
