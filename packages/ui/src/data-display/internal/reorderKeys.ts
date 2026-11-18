import type { KeyboardEvent } from 'react';

export const isLiftKey = (key: string) => key === ' ' || key === 'Enter';

export const isLiftedKey = (key: string) =>
  key === 'ArrowUp' || key === 'ArrowDown' || key === 'Home' || key === 'End' || key === 'Escape';

export function isRowMoveKey(event: KeyboardEvent<HTMLElement>) {
  return (
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
    isInsideRowTarget(event.target as HTMLElement)
  );
}

function isInsideRowTarget(element: HTMLElement) {
  return element.closest('[data-row-target]') !== null;
}
