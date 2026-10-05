// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function TopPanelClose({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="m452-432-98 98q-10 10-5 22t19 12h224q14 0 19-12t-5-22l-98-98q-12-12-28-12t-28 12ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-440v360h560v-360H200Z" /> : <path d="m452-432-98 98q-10 10-5 22t19 12h224q14 0 19-12t-5-22l-98-98q-12-12-28-12t-28 12ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm560-520v-120H200v120h560Zm-560 80v360h560v-360H200Zm0-80v-120 120Z" />}</Icon>;
}
