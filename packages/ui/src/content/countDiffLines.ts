import { parseDiffFromFile } from '@pierre/diffs';

/** How many lines a change adds and removes, such as for the size of a change beside its file's name. */
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
