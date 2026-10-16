import { plural } from './plural.js';

/**
 * The English defaults of the `diffStat` messages: DiffStat. EnvUIProvider's `messages.diffStat`
 * overrides any of them.
 */
export const diffStat = {
  /** Names the counts, such as 12 added lines and 3 removed lines. */
  label: ({ additions, deletions }: { additions: number; deletions: number }) =>
    `${additions} added ${plural(additions, 'line', 'lines')} and ${deletions} removed ${plural(deletions, 'line', 'lines')}`,
};

export type DiffStatMessages = typeof diffStat;
