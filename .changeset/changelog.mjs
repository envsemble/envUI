// Writes each changeset as one entry in the CHANGELOG.md of each package it names, such as
// packages/ui/CHANGELOG.md, without commit hashes, in the style of the earlier, hand-written entries. Changesets groups the entries under Major, Minor and
// Patch Changes.

/** @type {import('@changesets/types').ChangelogFunctions} */
export default {
  getReleaseLine(changeset) {
    const [first, ...rest] = changeset.summary.trim().split('\n');
    return [`- ${first}`, ...rest.map((line) => (line ? `  ${line}` : line))].join('\n');
  },
  // The published packages share one version and none depends on another, so no entry reports
  // updated internal dependencies.
  getDependencyReleaseLine: () => '',
};
