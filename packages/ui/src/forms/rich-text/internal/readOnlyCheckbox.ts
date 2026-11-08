import type { MouseEvent } from 'react';

/**
 * The props that make a task's Checkbox read-only, as in finished text: it keeps its colors and
 * says it is read-only (aria-readonly), takes no tab stop, and a press or Space doesn't change it.
 * The stylesheet stops the pointer (Checkbox.css).
 */
export const readOnlyCheckboxProps = {
  'aria-readonly': true,
  tabIndex: -1,
  onClick: (event: MouseEvent<HTMLInputElement>) => event.preventDefault(),
} as const;
