// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ViewCompact({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M880-170v-620 620ZM80-610v-180h170v180H80Zm210 0v-180h170v180H290Zm210 0v-180h170v180H500Zm210 0v-180h170v180H710Zm0 220v-180h170v180H710Zm-210 0v-180h170v180H500Zm-210 0v-180h170v180H290Zm-210 0v-180h170v180H80Zm630 220v-180h170v180H710Zm-210 0v-180h170v180H500Zm-210 0v-180h170v180H290Zm-210 0v-180h170v180H80Z" /> : <path d="M80-170v-620h800v620H80Zm80-440h100v-100H160v100Zm180 0h100v-100H340v100Zm180 0h100v-100H520v100Zm180 0h100v-100H700v100Zm0 180h100v-100H700v100Zm-180 0h100v-100H520v100Zm-180 0h100v-100H340v100Zm-80-100H160v100h100v-100Zm440 280h100v-100H700v100Zm-180 0h100v-100H520v100Zm-180 0h100v-100H340v100Zm-180 0h100v-100H160v100Z" />}</Icon>;
}
