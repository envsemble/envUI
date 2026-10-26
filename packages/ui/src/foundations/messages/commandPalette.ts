import { plural } from './plural.js';

/**
 * The English defaults of the `commandPalette` messages: CommandPalette. EnvUIProvider's
 * `messages.commandPalette` overrides any of them.
 */
export const commandPalette = {
  /** The empty state's title while the search field is empty and nothing shows in the list. */
  emptyQuery: 'Type to search',
  /** The empty state's title when the text in the search field finds nothing. */
  empty: 'No results',
  /** Under that title: what found nothing, and what to try, such as Nothing matches “roadmap”. */
  emptyHint: ({ query }: { query: string }) =>
    `Nothing matches “${query}”. Check the spelling or try other words.`,
  /** Announced as the results change, such as 3 results. */
  results: ({ count }: { count: number }) => `${count} ${plural(count, 'result', 'results')}`,
};

export type CommandPaletteMessages = typeof commandPalette;
