/**
 * The English defaults of the `codeDiff` messages: CodeDiff. EnvUIProvider's `messages.codeDiff`
 * overrides any of them.
 */
export const codeDiff = {
  /** The title when the changes could not be shown. */
  failed: 'Changes could not be shown',
  /** Says why, under the title. */
  failedDescription: 'The code highlighter did not load.',
  /** The retry button's label. */
  retry: 'Try again',
  /** Names the region while the changes load. */
  loading: 'Loading changes',
};

export type CodeDiffMessages = typeof codeDiff;
