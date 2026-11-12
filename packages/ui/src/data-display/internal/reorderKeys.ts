// The keys and presses a reorderable list takes for itself, which the controller handles
// (reorderController.ts) and the list's handles hold back from the browser until it has loaded
// (useReorder.ts).
import type { KeyboardEvent } from 'react';

/** Space and Enter on a handle lift its row, and drop it. */
export const isLiftKey = (key: string) => key === ' ' || key === 'Enter';

/** The keys on the handle of a row lifted by keyboard: they move it, or put it back with Escape. */
export const isLiftedKey = (key: string) =>
  key === 'ArrowUp' || key === 'ArrowDown' || key === 'Home' || key === 'End' || key === 'Escape';

/** Alt+↑ or Alt+↓ on a row's target, which moves the row one place at once. */
export function isRowMoveKey(event: KeyboardEvent<HTMLElement>) {
  return (
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
    // A key press on a row reaches it from an element inside it.
    (event.target as HTMLElement).closest('[data-row-target]') !== null
  );
}
