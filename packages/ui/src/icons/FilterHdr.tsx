// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function FilterHdr({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="m88-304 160-213q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l136 181q6 8 14 12t18 4q25 0 36-22.5t-4-42.5l-84-111q-8-11-8-24t8-24l100-133q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l280 373q15 20 4 42t-36 22H120q-25 0-36-22t4-42Z" /> : <path d="M120-240q-25 0-36-22t4-42l160-213q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l148 197h300L560-586l-68 90q-12 16-28 16.5t-28-8.5q-12-9-16-24.5t8-31.5l100-133q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l280 373q15 20 4 42t-36 22H120Zm340-80h300-312 68.5H460Zm-260 0h160l-80-107-80 107Zm0 0h160-160Z" />}</Icon>;
}
