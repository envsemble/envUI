// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function ComicBubble({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M828-132q-8 8-20.5 11t-25.5-4L556-240l-88 88q-12 12-28 12t-28-12l-88-88H200q-17 0-28.5-11.5T160-280v-124l-88-88q-12-12-12-28t12-28l88-88v-124q0-17 11.5-28.5T200-800h124l88-88q12-12 28-12t28 12l88 88h124q17 0 28.5 11.5T720-760v124l88 88q12 12 12 28t-12 28l-88 88 115 226q7 13 4 25.5T828-132Z" /> : <path d="m708-252-86-167 101-101-83-83v-117H523l-83-83-83 83H240v117l-83 83 83 83v117h117l83 83 100-100 168 85Zm120 120q-8 8-20.5 11t-25.5-4L556-240l-88 88q-12 12-28 12t-28-12l-88-88H200q-17 0-28.5-11.5T160-280v-124l-88-88q-12-12-12-28t12-28l88-88v-124q0-17 11.5-28.5T200-800h124l88-88q12-12 28-12t28 12l88 88h124q17 0 28.5 11.5T720-760v124l88 88q12 12 12 28t-12 28l-88 88 115 226q7 13 4 25.5T828-132ZM440-520Z" />}</Icon>;
}
