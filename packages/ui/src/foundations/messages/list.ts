/**
 * The English defaults of the `list` messages: List. EnvUIProvider's `messages.list` overrides any
 * of them. In the announcements, `position` and `count` are in the locale's digits.
 */
export const list = {
  /** A row's drag handle, such as Reorder Intro slide. */
  reorder: ({ label }: { label: string }) => `Reorder ${label}`,
  /** Describes each drag handle: how to move its row without a pointer. */
  instructions:
    'Press Space or Enter, or click, to pick the row up. Then use the arrow keys to move it, and press Space or Enter, or click, to drop it. Escape cancels.',
  /** Announced when a row is picked up by keyboard or a press of its handle. */
  lifted: ({ label, position, count }: { label: string; position: string; count: string }) =>
    `${label} picked up, position ${position} of ${count}. Use the arrow keys to move it, Space to drop it and Escape to cancel.`,
  /** Announced when the pointer starts dragging a row. */
  liftedByPointer: ({
    label,
    position,
    count,
  }: {
    label: string;
    position: string;
    count: string;
  }) =>
    `${label} picked up, position ${position} of ${count}. Drag it to its place and release it to drop it.`,
  /** Announced as a picked-up row moves. */
  moved: ({ label, position, count }: { label: string; position: string; count: string }) =>
    `${label} moved to position ${position} of ${count}.`,
  /** Announced when a row can't move further up: it is first. */
  atStart: ({ label, position, count }: { label: string; position: string; count: string }) =>
    `${label} is at the start of the list, position ${position} of ${count}.`,
  /** Announced when a row can't move further down: it is last. */
  atEnd: ({ label, position, count }: { label: string; position: string; count: string }) =>
    `${label} is at the end of the list, position ${position} of ${count}.`,
  /** Announced when a row is dropped in its new place. */
  dropped: ({ label, position, count }: { label: string; position: string; count: string }) =>
    `${label} dropped at position ${position} of ${count}.`,
  /** Announced when a move is cancelled and the row goes back. */
  cancelled: ({ label, position, count }: { label: string; position: string; count: string }) =>
    `Move cancelled. ${label} is back at position ${position} of ${count}.`,
};

export type ListMessages = typeof list;
