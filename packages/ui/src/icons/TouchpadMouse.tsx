// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../foundations/Icon.js';
import { useSymbolIconFill } from '../internal/icon/SymbolIconFill.js';

export function IconTouchpadMouse({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}>{filled ? <path d="M660-80q-91 0-155.5-64.5T440-300v-60h440v60q0 91-64 155.5T660-80Zm-500-80q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v35q0 17-16 24.5t-30-3.5q-38-27-82-41.5T660-720q-125 0-212.5 87.5T360-420v120q0 24 3 47t11 46q5 17-4.5 32T343-160H160Zm280-280q3-75 54-129.5T620-637v197H440Zm260 0v-197q75 13 126 67.5T880-440H700Z" /> : <path d="M660-160q58 0 99-41t41-99v-60H520v60q0 58 41 99t99 41ZM521-440h99v-114q-38 11-65.5 42T521-440Zm179 0h99q-6-41-33.5-72T700-554v114ZM660-80q-92 0-156-64t-64-156v-120q0-92 64-156t156-64q92 0 156 64t64 156v120q0 92-64 156T660-80Zm-500-80q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h680q17 0 28.5 11.5T880-760q0 17-11.5 28.5T840-720H160v480h161q17 0 28.5 11.5T361-200q0 17-11.5 28.5T321-160H160Zm0-80v-480 480Z" />}</Icon>;
}
