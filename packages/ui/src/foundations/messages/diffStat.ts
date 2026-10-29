import { plural } from './plural.js';

/**
 * The English defaults of the `diffStat` messages: DiffStat. EnvUIProvider's `messages.diffStat`
 * overrides any of them.
 */
export const diffStat = {
  /**
   * Names the counts, such as 12 added lines and 3 removed lines; `additionsText` and
   * `deletionsText` are the counts in the locale's digits.
   */
  label: ({
    additions,
    deletions,
    additionsText,
    deletionsText,
  }: {
    additions: number;
    deletions: number;
    additionsText: string;
    deletionsText: string;
  }) =>
    `${additionsText} added ${plural(additions, 'line', 'lines')} and ${deletionsText} removed ${plural(deletions, 'line', 'lines')}`,
};

export type DiffStatMessages = typeof diffStat;
