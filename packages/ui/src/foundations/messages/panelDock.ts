/**
 * The English defaults of the `panelDock` messages: PanelDock. EnvUIProvider's
 * `messages.panelDock` overrides any of them.
 */
export const panelDock = {
  /** A minimized panel's button, such as Show Notes. */
  open: ({ label }: { label: string }) => `Show ${label}`,
  /** A minimized panel's close button, such as Close Notes. */
  close: ({ label }: { label: string }) => `Close ${label}`,
  /** A panel's resize handle, such as Resize Notes. */
  resize: ({ label }: { label: string }) => `Resize ${label}`,
  /** Names the minimized panels. */
  minimized: 'Hidden panels',
  /** A window control. */
  minimize: 'Minimize',
  /** A window control. */
  maximize: 'Maximize',
  /** A window control. */
  restore: 'Restore',
  /** A window control: closes the panel. */
  closeWindow: 'Close',
};

export type PanelDockMessages = typeof panelDock;
