/**
 * The English defaults of the `table` messages: Table. EnvUIProvider's `messages.table` overrides
 * any of them.
 */
export const table = {
  /** Read after a sortable column's name while pressing sorts it ascending. */
  sortAscending: 'sort ascending',
  /** Read after a sortable column's name while pressing sorts it descending. */
  sortDescending: 'sort descending',
  /** A column's resize handle. */
  resize: 'Resize',
};

export type TableMessages = typeof table;
