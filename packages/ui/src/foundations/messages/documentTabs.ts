/**
 * The English defaults of the `documentTabs` messages: DocumentTabs. EnvUIProvider's
 * `messages.documentTabs` overrides any of them.
 */
export const documentTabs = {
  /** A tab's close button, such as Close Report.md. */
  close: ({ label }: { label: string }) => `Close ${label}`,
  /** Closes every tab. */
  closeAll: 'Close all tabs',
  /** Names a tab's menu of actions. */
  actions: 'Tab actions',
};

export type DocumentTabsMessages = typeof documentTabs;
