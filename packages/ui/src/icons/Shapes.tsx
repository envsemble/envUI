// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/GenerateIcons.mjs to regenerate. Do not edit.
import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

export function Shapes({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M360-320q-117 0-198.5-81.5T80-600q0-117 81.5-198.5T360-880q117 0 198.5 81.5T640-600q0 117-81.5 198.5T360-320Zm40 240q-33 0-56.5-23.5T320-160v-46q0-14 10.5-24.5T356-241q75 0 140-25t119-79q54-54 79-119t25-140q0-15 10.5-25.5T754-640h46q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H400Z" /> : <path d="M600-360ZM400-80q-33 0-56.5-23.5T320-160v-40q0-17 11.5-28.5T360-240q17 0 28.5 11.5T400-200v40h400v-400h-40q-17 0-28.5-11.5T720-600q0-17 11.5-28.5T760-640h40q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H400Zm-40-240q-117 0-198.5-81.5T80-600q0-117 81.5-198.5T360-880q117 0 198.5 81.5T640-600q0 117-81.5 198.5T360-320Zm0-80q83 0 141.5-58.5T560-600q0-83-58.5-141.5T360-800q-83 0-141.5 58.5T160-600q0 83 58.5 141.5T360-400Zm0-200Z" />}</Icon>;
}
