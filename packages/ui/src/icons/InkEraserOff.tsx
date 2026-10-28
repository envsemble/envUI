// Generated from Google Material Symbols (bd8cb85bd4bad964fe6918f79665bb40c3a8efef); Apache-2.0.
// Run node scripts/build/GenerateIcons.ts to regenerate. Do not edit.
'use client';

import { Icon, type MaterialSymbolProps } from '../Icon.js';
import { useMaterialSymbolFill } from '../MaterialSymbolState.js';

/** The path both styles start with. */
const start = "M763-84 602-244l-58 60q-11 11-25.5 17.5T487-160H223q-16 0-30.5-6T167-183l-62-62q-23-23-23.5-57t22.5-58l188-194L83-763q-12-12-12-28.5T83-820q12-12 28.5-12t28.5 12l680 680q12 12 12 28t-12 28q-12 12-28.5 12T763-84Z";

export function InkEraserOff({ filled: requestedFill, ...props }: MaterialSymbolProps) {
  const filled = useMaterialSymbolFill(requestedFill);
  return <Icon viewBox="0 -960 960 960" {...props}><path d={filled ? start + "m116-477q0 16-5.5 30.5T856-504L743-388q-12 12-28.5 12T686-388L432-642q-11-11-11.5-27.5T431-698l113-118q12-12 27-18t30-6q16 0 30.5 5.5T657-817l199 199q12 11 17.5 26t5.5 31Z" : start + "M224-240h262l59-61-197-197-188 194 64 64Zm655-321q0 16-5.5 30.5T856-504L743-388q-12 12-28.5 12T686-388q-12-12-11.5-28t11.5-28l114-118-198-198-114 117q-11 12-28 12t-29-12q-11-11-11-27t11-28l113-118q12-12 27-18t30-6q16 0 30.5 5.5T657-817l199 199q12 11 17.5 26t5.5 31Zm-320 46ZM447-400Z"} /></Icon>;
}
