// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../foundations/NavigationIconState.js';

export function IconNestWifiRouter({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M360-120q-77 0-138.5-44T134-280h692q-26 72-87.5 116T600-120H360ZM120-360v-240q0-100 70-170t170-70h240q100 0 170 70t70 170v240H120Z" /> : <path d="M360-120q-100 0-170-70t-70-170v-240q0-100 70-170t170-70h240q100 0 170 70t70 170v240q0 100-70 170t-170 70H360ZM200-360h560v-240q0-66-47-113t-113-47H360q-66 0-113 47t-47 113v240Zm22 80q21 36 57 58t81 22h240q45 0 81-22t57-58H222Zm258-80Z" />}</Icon>;
}
