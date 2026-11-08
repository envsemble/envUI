/**
 * The English defaults of the `documentTabs` messages: DocumentTabs. EnvUIProvider's
 * `messages.documentTabs` overrides any of them.
 */
export const documentTabs = {
  /** A tab's close button, such as Close Report.md. */
  close: ({ label }: { label: string }) => `Close ${label}`,
  /** Closes every tab. */
  closeAll: 'Close all tabs',
  /** Moves a tab one place to the left, in its context menu. */
  moveLeft: 'Move left',
  /** Moves a tab one place to the right, in its context menu. */
  moveRight: 'Move right',
  /** Names a tab's menu of actions. */
  contextMenu: 'Tab actions',
};
