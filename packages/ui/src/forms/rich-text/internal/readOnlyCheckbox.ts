import type { MouseEvent } from 'react';

export const readOnlyCheckboxProps = {
  'aria-readonly': true,
  tabIndex: -1,
  onClick: (event: MouseEvent<HTMLInputElement>) => event.preventDefault(),
} as const;
