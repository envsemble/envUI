/**
 * The English defaults of the `codeDiff` messages: CodeDiff. EnvUIProvider's `messages.codeDiff`
 * overrides any of them.
 */
export const codeDiff = {
  /** The title when the changes could not be shown. */
  failed: 'Changes could not be shown',
  /** The retry button's label. */
  retry: 'Retry',
  /** Names the region while the changes load. */
  loading: 'Loading changes',
};

export type CodeDiffMessages = typeof codeDiff;
