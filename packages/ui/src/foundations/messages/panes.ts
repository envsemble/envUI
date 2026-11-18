/**
 * The English defaults of the `panes` messages: Panes. EnvUIProvider's `messages.panes` overrides
 * any of them.
 */
export const panes = {
  /** The resize handle's name, which resizes the panes. */
  resize: 'Resize panes',
  /** The handle's value: the sized pane's width in rem, such as 22.5 rem, in the locale's digits. */
  size: ({ size }: { size: string }) => `${size} rem`,
};
