/**
 * The English defaults of the `splitPane` messages: SplitPane and ListDetail. EnvUIProvider's
 * `messages.splitPane` overrides any of them.
 */
export const splitPane = {
  /** The resize handle's name between the panes. */
  resize: 'Resize panes',
  /**
   * The handle's value for a size in rem, such as 32%, 18 rem: the first pane's share of the split
   * pane, then its size; `share` and `size` are in the locale's digits.
   */
  remValue: ({ share, size }: { share: string; size: string }) => `${share}, ${size} rem`,
};

export type SplitPaneMessages = typeof splitPane;
