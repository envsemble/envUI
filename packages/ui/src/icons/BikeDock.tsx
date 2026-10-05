// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function BikeDock({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M158-120q-17 0-27.5-13T120-163q0-15 6.5-27.5T147-207l143-41 61-521q4-30 26.5-50.5T431-840h97q31 0 53.5 20.5T608-769l61 521 142 40q14 5 21.5 17t7.5 27q0 18-11.5 31T800-120H158Zm282-120h80v-480q0-17-11.5-28.5T480-760q-17 0-28.5 11.5T440-720v480Z" /> : <path d="M158-120q-17 0-27.5-13T120-163q0-17 10-29.5t26-17.5l134-38 61-521q4-30 26.5-50.5T431-840h97q31 0 53.5 20.5T608-769l61 521 133 38q17 5 27.5 17t10.5 29q0 18-11.5 31T800-120H158Zm282-120h80v-480q0-17-11.5-28.5T480-760q-17 0-28.5 11.5T440-720v480Z" />}</Icon>;
}
