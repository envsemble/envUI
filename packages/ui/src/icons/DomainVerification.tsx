// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function DomainVerification({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="m438-414-55-55q-12-12-29-12t-29 12q-12 12-12 29t12 29l85 85q12 12 28 12t28-12l169-169q12-12 12-29t-12-29q-12-12-29-12t-29 12L438-414ZM160-640h640v-80H160v80Zm0 480q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z" /> : <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm278-174 139-139q12-12 29-12t29 12q12 12 12 29t-12 29L466-326q-12 12-28 12t-28-12l-85-85q-12-12-12-29t12-29q12-12 29-12t29 12l55 55ZM160-240v-480 480Z" />}</Icon>;
}
