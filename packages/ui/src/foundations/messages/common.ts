/**
 * The English defaults of the `common` messages: Words several components share. EnvUIProvider's
 * `messages.common` overrides any of them.
 */
export const common = {
  /** Closes a dialog, a panel or a message; CloseButton's name. */
  close: 'Close',
  /** Clears a field's value. */
  clear: 'Clear',
  /** Names a region or a bar while its content loads. */
  loading: 'Loading',
  /** Opens more actions or items. */
  more: 'More',
};

export type CommonMessages = typeof common;
