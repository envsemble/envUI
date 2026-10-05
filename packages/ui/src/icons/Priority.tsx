// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function Priority({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M360-120q-100 0-170-70t-70-170v-240q0-100 70-170t170-70h240q100 0 170 70t70 170v240q0 100-70 170t-170 70H360Zm80-312-60-60q-11-11-28-11t-28 11q-11 11-11 28t11 28l88 88q12 12 28 12t28-12l184-184q11-11 11-28t-11-28q-11-11-28-11t-28 11L440-432Z" /> : <path d="M360-120q-100 0-170-70t-70-170v-240q0-100 70-170t170-70h240q100 0 170 70t70 170v240q0 100-70 170t-170 70H360Zm80-312-60-60q-11-11-28-11t-28 11q-11 11-11 28t11 28l88 88q12 12 28 12t28-12l184-184q11-11 11-28t-11-28q-11-11-28-11t-28 11L440-432Zm-80 232h240q66 0 113-47t47-113v-240q0-66-47-113t-113-47H360q-66 0-113 47t-47 113v240q0 66 47 113t113 47Zm120-280Z" />}</Icon>;
}
