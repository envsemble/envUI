/**
 * The English defaults of the `appShell` messages: AppShell. EnvUIProvider's `messages.appShell`
 * overrides any of them.
 */
export const appShell = {
  /** Names the page progress bar while a page loads. */
  loadingPage: 'Loading page',
  /** The sidebar toggle's name while the sidebar is collapsed. */
  expandSidebar: 'Expand sidebar',
  /** The sidebar toggle's name while the sidebar is expanded. */
  collapseSidebar: 'Collapse sidebar',
  /** The sidebar resize handle's name. */
  resizeSidebar: 'Resize sidebar',
  /** Names the skeleton shell while it stands in for the app. */
  loading: 'Loading',
};

export type AppShellMessages = typeof appShell;
