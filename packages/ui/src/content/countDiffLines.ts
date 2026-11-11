// Not a client module, so a server component can count a diff as well as a client one.
import { parseDiffFromFile } from '@pierre/diffs';

/** How many lines a change adds and removes, as a DiffStat shows them. */
export function countDiffLines(before: string, after: string, filename = 'file') {
  if (before === after) return { additions: 0, deletions: 0 };
  const diff = parseDiffFromFile(
    { name: filename, contents: before },
    { name: filename, contents: after },
  );
  return diff.hunks.reduce(
    (totals, hunk) => ({
      additions: totals.additions + hunk.additionLines,
      deletions: totals.deletions + hunk.deletionLines,
    }),
    { additions: 0, deletions: 0 },
  );
}
