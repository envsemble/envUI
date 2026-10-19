/**
 * The English defaults of the `markdown` messages: Markdown. EnvUIProvider's `messages.markdown`
 * overrides any of them.
 */
export const markdown = {
  /** Names a table region without a caption or heading. */
  table: 'Table',
  /** Names a table region after the heading before it, such as Prices table. */
  tableNamed: ({ name }: { name: string }) => `${name} table`,
  /** A completed task's checkbox. */
  taskDone: 'Completed task',
  /** An incomplete task's checkbox. */
  taskOpen: 'Incomplete task',
};

export type MarkdownMessages = typeof markdown;
