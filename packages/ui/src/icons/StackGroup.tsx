// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function StackGroup({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M400-80q-33 0-56.5-23.5T320-160v-160H160q-33 0-56.5-23.5T80-400v-400q0-33 23.5-56.5T160-880h400q33 0 56.5 23.5T640-800v160h160q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H400Z" /> : <path d="M400-80q-33 0-56.5-23.5T320-160v-160H160q-33 0-56.5-23.5T80-400v-400q0-33 23.5-56.5T160-880h400q33 0 56.5 23.5T640-800v160h160q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H400Zm0-80h400v-400H640q-33 0-56.5-23.5T560-640v-160H160v400h160q33 0 56.5 23.5T400-320v160Zm80-320Z" />}</Icon>;
}
