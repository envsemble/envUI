import { plural } from './plural.js';

/**
 * The English defaults of the `commandPalette` messages: CommandPalette. EnvUIProvider's
 * `messages.commandPalette` overrides any of them.
 */
export const commandPalette = {
  /** Shown in place of the list when nothing matches. */
  empty: 'No results',
  /** Announced as the results change, such as 3 results. */
  results: ({ count }: { count: number }) => `${count} ${plural(count, 'result', 'results')}`,
};

export type CommandPaletteMessages = typeof commandPalette;
