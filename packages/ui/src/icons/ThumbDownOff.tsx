// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type SymbolIconProps } from '../Icon.js';
import { useSymbolIconFill } from '../SymbolIconState.js';

export function IconThumbDownOff({ filled: requestedFill, ...props }: SymbolIconProps) {
  const filled = useSymbolIconFill(requestedFill);
  return <Icon viewBox="0 0 24 24" {...props}>{filled ? <path d="M3 16q-.8 0-1.4-.6Q1 14.8 1 14v-2q0-.175.038-.375.037-.2.112-.375l3-7.05q.225-.5.75-.85T6 3h8q.825 0 1.413.587Q16 4.175 16 5v10.175q0 .4-.162.763-.163.362-.438.637l-5.425 5.4q-.375.35-.887.425-.513.075-.988-.175t-.688-.7q-.212-.45-.087-.925L8.45 16ZM20 3q.825 0 1.413.587Q22 4.175 22 5v9q0 .825-.587 1.412Q20.825 16 20 16q-.825 0-1.413-.588Q18 14.825 18 14V5q0-.825.587-1.413Q19.175 3 20 3Z" /> : <path d="M3 16q-.8 0-1.4-.6Q1 14.8 1 14v-2q0-.175.05-.375t.1-.375l3-7.05q.225-.5.75-.85T6 3h11v13l-6 5.95q-.375.375-.887.437-.513.063-.988-.187t-.7-.7q-.225-.45-.1-.925L9.45 16Zm12-.85V5H6l-3 7v2h9l-1.35 5.5ZM20 3q.825 0 1.413.587Q22 4.175 22 5v9q0 .825-.587 1.412Q20.825 16 20 16h-3v-2h3V5h-3V3Zm-5 2v10.15V5Z" />}</Icon>;
}
