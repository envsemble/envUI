import type { SyntheticEvent } from 'react';

/**
 * One event handler from the one given to a component and the component's own: the given one runs
 * first, and one that calls preventDefault stops the component's own.
 */
export function chainHandlers<Event extends SyntheticEvent>(
  theirs: ((event: Event) => void) | undefined,
  ours: ((event: Event) => void) | undefined,
) {
  if (!theirs) return ours;
  if (!ours) return theirs;
  return (event: Event) => {
    theirs(event);
    if (!event.defaultPrevented) ours(event);
  };
}
