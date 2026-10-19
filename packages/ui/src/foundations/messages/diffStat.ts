import { plural } from './plural.js';

/**
 * The English defaults of the `diffStat` messages: DiffStat. EnvUIProvider's `messages.diffStat`
 * overrides any of them.
 */
export const diffStat = {
  /**
   * Names the counts, such as 12 added lines and 3 removed lines; `added` and `removed` are the
   * counts in the locale's digits.
   */
  label: ({
    additions,
    deletions,
    added,
    removed,
  }: {
    additions: number;
    deletions: number;
    added: string;
    removed: string;
  }) =>
    `${added} added ${plural(additions, 'line', 'lines')} and ${removed} removed ${plural(deletions, 'line', 'lines')}`,
};

export type DiffStatMessages = typeof diffStat;
