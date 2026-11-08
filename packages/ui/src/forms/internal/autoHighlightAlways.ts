/**
 * The autoHighlight value that keeps the first match highlighted also when the options change
 * after typing, such as when a server's results arrive, so Enter chooses it. Base UI documents
 * 'always' for Autocomplete, which shares the Combobox's implementation (AriaCombobox accepts it),
 * but Combobox.Root's props declare autoHighlight as a boolean (@base-ui/react 1.9.0), hence the
 * cast. Pass 'always' directly, and delete this file, once Combobox.Root's type accepts it; the
 * Combobox spec's test of options that arrive after typing guards the behaviour.
 */
export const autoHighlightAlways = 'always' as unknown as boolean;
