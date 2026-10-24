/**
 * The English defaults of the `dialog` messages: Dialog and Sheet. EnvUIProvider's
 * `messages.dialog` overrides any of them.
 */
export const dialog = {
  /** The built-in close button's label. */
  close: 'Close',
  /** Names the handle that resizes a resizable side Sheet. */
  resize: 'Resize',
  /** The resize handle's value: the Sheet's width in rem, such as 24 rem, in the locale's digits. */
  width: ({ width }: { width: string }) => `${width} rem`,
};

export type DialogMessages = typeof dialog;
