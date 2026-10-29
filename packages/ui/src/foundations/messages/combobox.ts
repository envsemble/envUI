/**
 * The English defaults of the `combobox` messages: Combobox. EnvUIProvider's `messages.combobox`
 * overrides any of them.
 */
export const combobox = {
  /** A chip's remove button, such as Remove Alex Morgan. */
  remove: ({ label }: { label: string }) => `Remove ${label}`,
  /** Shown in the popup while options load. */
  loading: 'Loading…',
  /** Shown in the popup when no option matches. */
  empty: 'No matches',
  /** The clear button's name. */
  clear: 'Clear',
};

export type ComboboxMessages = typeof combobox;
