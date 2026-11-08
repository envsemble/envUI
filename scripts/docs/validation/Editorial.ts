// What a page's text gets wrong regardless of where it stands: its headings, its Accessibility
// section's lists and keyboard table, and its Changelog's order.
import type { Token, Tokens } from 'marked';

/** The `###` lists a component's or a pattern's Accessibility section needs. */
const providesHeadings = ['envUI provides', 'You provide'];

/**
 * What an Accessibility section lacks: the `###` lists of what envUI and the application provide,
 * and a Key and Action table under `### Keyboard`.
 */
export function accessibilityProblems(tokens: Token[]) {
  const problems: string[] = [];
  const headings = tokens
    .filter((token): token is Tokens.Heading => token.type === 'heading' && token.depth === 3)
    .map((token) => token.text);
  for (const required of providesHeadings) {
    const start = tokens.findIndex(
      (token) => token.type === 'heading' && token.depth === 3 && token.text === required,
    );
    const list = tokens
      .slice(start + 1)
      .find((token) => token.type === 'list' || token.type === 'heading');
    if (
      start === -1 ||
      list?.type !== 'list' ||
      !(list as Tokens.List).items.some((item) => item.text.trim())
    )
      problems.push(`"## Accessibility" needs a "### ${required}" list`);
  }
  if (headings.includes('Keyboard')) {
    const start = tokens.findIndex(
      (token) => token.type === 'heading' && token.text === 'Keyboard',
    );
    const table = tokens
      .slice(start + 1)
      .find((token) => token.type === 'table' || (token.type === 'heading' && token.depth <= 3));
    const header =
      table?.type === 'table' ? (table as Tokens.Table).header.map((cell) => cell.text) : [];
    if (header[0] !== 'Key' || header[1] !== 'Action')
      problems.push('"### Keyboard" needs a table with "Key" and "Action" columns');
  }
  return problems;
}

/**
 * A version's place in a changelog: 1.0.0 after 0.7.0, and a release after its prereleases, so
 * 1.0.0 after 1.0.0-prerelease.6, which comes after 1.0.0-prerelease.5.
 */
function versionRank(version: string) {
  const [release, prerelease] = version.split('-');
  const numbers = release.split('.').map(Number);
  return [...numbers, prerelease === undefined ? 1 : 0, Number(prerelease?.split('.').at(-1) ?? 0)];
}

/** Orders versions from the oldest, as versionRank places them. */
function compareChangelogVersions(a: string, b: string) {
  const [x, y] = [versionRank(a), versionRank(b)];
  for (const [index, part] of x.entries()) if (part !== y[index]) return part - y[index];
  return 0;
}

/** What a Changelog's entries get wrong: they run from the newest version to the oldest. */
export function changelogProblems(tokens: Token[]) {
  const versions = tokens
    .filter((token): token is Tokens.List => token.type === 'list')
    .flatMap((list) => list.items)
    .map((item) => /^\*\*([^*]+)\*\*:/.exec(item.text)?.[1])
    .filter((version): version is string => Boolean(version));
  const misplaced = versions.find(
    (version, index) => index > 0 && compareChangelogVersions(versions[index - 1]!, version) < 0,
  );
  return misplaced
    ? [`"## Changelog" lists ${misplaced} below an older version: list the newest first`]
    : [];
}

/** Problems of any heading: the title is the only `#`, and props are generated. */
export function headingProblems(token: Token) {
  const problems: string[] = [];
  if (token.type === 'heading' && token.depth === 1)
    problems.push('only the title is a level-one heading');
  if (token.type === 'html' && /<h[1-6][\s>]/i.test(token.raw))
    problems.push(`write headings in Markdown, not as HTML: ${token.raw.trim().split('\n')[0]}`);
  // "### Props" and "### Props & contracts", but not "### Props forwarding".
  if (
    token.type === 'heading' &&
    token.depth >= 3 &&
    /^props(?:$|\s*(?:&|and)\s)/i.test(token.text.trim())
  )
    problems.push(
      `"${'#'.repeat(token.depth)} ${token.text}" lists props by hand; the Props section is generated`,
    );
  return problems;
}
