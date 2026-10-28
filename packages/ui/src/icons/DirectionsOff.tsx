// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M791-57 640-208 536-104q-12 12-26.5 18T480-80q-15 0-29.5-6T424-104L104-424q-12-12-18-26.5T80-480q0-15 6-29.5t18-26.5l1";

export function DirectionsOff({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "61-161 225 225-1 114L55-792q-12-12-11.5-28.5T56-849q12-12 28.5-12t28.5 12l735 736q12 12 12 28t-12 28q-12 12-28.5 12T791-57ZM360-360q17 0 28.5-11.5T400-400v-80h81l-80-80h-41q-17 0-28.5 11.5T320-520v120q0 17 11.5 28.5T360-360Zm520-120q0 15-6 29.5T856-424l-74 74q-12 12-28 12t-28-12L618-458l34-34q12-12 12-28t-12-28l-84-84q-8-8-18-3.5T540-620v60h-24L350-726q-12-12-12-28t12-28l74-74q12-12 26.5-18t29.5-6q15 0 29.5 6t26.5 18l320 320q12 12 18 26.5t6 29.5Z" : start + "04-104L55-792q-12-12-11.5-28.5T56-849q12-12 28.5-12t28.5 12l735 736q12 12 12 28t-12 28q-12 12-28.5 12T791-57ZM584-264 264-584 160-480l320 320 104-104Zm296-216q0 15-6 29.5T856-424l-74 74q-11 11-28 11t-28-11q-11-11-11-28t11-28l74-74-320-320-74 74q-11 11-28 11t-28-11q-11-11-11-28t11-28l74-74q12-12 26.5-18t29.5-6q15 0 29.5 6t26.5 18l320 320q12 12 18 26.5t6 29.5Zm-342-58ZM424-424Zm-104 24v-120q0-17 11.5-28.5T360-560h41l80 80h-81v80q0 17-11.5 28.5T360-360q-17 0-28.5-11.5T320-400Zm298-58 34-34q12-12 12-28t-12-28l-78-78q-10-10-22-5t-12 19v52h-24l102 102Z"} /></Icon>;
}
