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
  /** The sidebar toggle's name while a collapsed sidebar is shown over the content. */
  keepSidebarOpen: 'Keep sidebar open',
  /**
   * The name of the button that opens a sidebar in a drawer on a narrow screen: Open navigation at
   * the start, and Open with the sidebar's label at the end, such as Open Directory.
   */
  openSidebar: ({ label, side }: { label: string; side: 'start' | 'end' }) =>
    side === 'end' ? `Open ${label}` : 'Open navigation',
  /** The sidebar resize handle's name. */
  resizeSidebar: 'Resize sidebar',
  /** The skip link to the main content. */
  skipToContent: 'Skip to content',
  /** A skip link to another region, such as Skip to Directory. */
  skipTo: ({ label }: { label: string }) => `Skip to ${label}`,
  /** Names the skeleton shell while it stands in for the app. */
  loading: 'Loading',
};

export type AppShellMessages = typeof appShell;
