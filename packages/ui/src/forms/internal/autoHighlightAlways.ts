/**
 * The autoHighlight value that also highlights the first option again once the query is cleared,
 * where `true` leaves the highlight on the option the arrow keys last reached. (Options that arrive
 * after typing, such as a server's results, have the first highlighted either way.) Base UI
 * documents 'always' for Autocomplete, which shares the Combobox's implementation (AriaCombobox
 * accepts it), but Combobox.Root's props declare autoHighlight as a boolean (@base-ui/react 1.9.0),
 * hence the cast. Pass 'always' directly, and delete this file, once Combobox.Root's type accepts
 * it; the Combobox component test of a cleared query guards the behaviour.
 */
export const autoHighlightAlways = 'always' as unknown as boolean;
