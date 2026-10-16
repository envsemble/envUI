/**
 * The English defaults of the `copy` messages: CopyButton. EnvUIProvider's `messages.copy`
 * overrides any of them.
 */
export const copy = {
  /** The button's name. */
  copy: 'Copy',
  /** Shown and announced once the text is copied. */
  copied: 'Copied',
  /** Shown and announced when the clipboard refuses. */
  failed: 'Couldn’t copy',
  /** Reported when the clipboard is unavailable. */
  unavailable: 'The clipboard is unavailable.',
};

export type CopyMessages = typeof copy;
