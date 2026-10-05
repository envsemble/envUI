// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function Layers({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M161-366q-16-12-15.5-31.5T162-429q11-8 24-8t24 8l270 209 270-209q11-8 24-8t24 8q16 12 16.5 31.5T799-366L529-156q-22 17-49 17t-49-17L161-366Zm270 8L201-537q-31-24-31-63t31-63l230-179q22-17 49-17t49 17l230 179q31 24 31 63t-31 63L529-358q-22 17-49 17t-49-17Z" /> : <path d="M161-366q-16-12-15.5-31.5T162-429q11-8 24-8t24 8l270 209 270-209q11-8 24-8t24 8q16 12 16.5 31.5T799-366L529-156q-22 17-49 17t-49-17L161-366Zm270 8L201-537q-31-24-31-63t31-63l230-179q22-17 49-17t49 17l230 179q31 24 31 63t-31 63L529-358q-22 17-49 17t-49-17Zm49-64 230-178-230-178-230 178 230 178Zm0-178Z" />}</Icon>;
}
