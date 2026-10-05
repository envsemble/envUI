// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function DualScreen({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M210-182q-23-9-36.5-29T160-256v-544q0-42 35-65.5t75-8.5l238 95q23 9 37.5 29.5T560-704v544q0 42-35 66t-75 8l-240-96Zm430-18v-504q0-67-54-108.5T467-880h253q33 0 56.5 23.5T800-800v520q0 33-23.5 56.5T720-200h-80Z" /> : <path d="m240-256 240 96v-544l-240-96v544Zm-30 74q-23-9-36.5-29T160-256v-544q0-33 23.5-56.5T240-880l268 101q23 9 37.5 29.5T560-704v544q0 43-35 66.5T450-86l-240-96Zm270-18v-80h240v-520H240v-80h480q33 0 56.5 23.5T800-800v520q0 33-23.5 56.5T720-200H480Zm-240-56v-544 544Z" />}</Icon>;
}
