/**
 * The English defaults of the `panes` messages: Panes. EnvUIProvider's `messages.panes` overrides
 * any of them.
 */
export const panes = {
  /** The divider's name, which resizes the panes. */
  resize: 'Resize panes',
  /** The divider's value: the resized pane's width in rem, such as 22.5 rem, in the locale's digits. */
  size: ({ size }: { size: string }) => `${size} rem`,
  /** The back button of a list-detail's detail while one pane shows at a time. */
  back: 'Back',
  /** The close button of the supporting pane while it is a sheet. */
  close: 'Close',
};
