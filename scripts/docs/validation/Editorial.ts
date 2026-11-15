import type { Token, Tokens } from 'marked';

export function accessibilityProblems(tokens: Token[]) {
  const problems: string[] = [];
  const headings = tokens
    .filter((token): token is Tokens.Heading => token.type === 'heading' && token.depth === 3)
    .map((token) => token.text);
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

function versionRank(version: string) {
  const [release, prerelease] = version.split('-');
  const numbers = release.split('.').map(Number);
  return [...numbers, prerelease === undefined ? 1 : 0, Number(prerelease?.split('.').at(-1) ?? 0)];
}

function compareChangelogVersions(a: string, b: string) {
  const [x, y] = [versionRank(a), versionRank(b)];
  for (const [index, part] of x.entries()) if (part !== y[index]) return part - y[index];
  return 0;
}

export function changelogProblems(tokens: Token[]) {
  const versions = tokens
    .filter((token): token is Tokens.List => token.type === 'list')
    .flatMap((list) => list.items)
    .map((item) => /^\*\*([^*]+)\*\*:/.exec(item.text)?.[1])
    .filter((version): version is string => Boolean(version));
  const misplaced = versions.find(
    (version, index) => index > 0 && compareChangelogVersions(versions[index - 1], version) < 0,
  );
  return misplaced
    ? [`"## Changelog" lists ${misplaced} below an older version: list the newest first`]
    : [];
}

export function headingProblems(token: Token) {
  const problems: string[] = [];
  if (token.type === 'heading' && token.depth === 1)
    problems.push('only the title is a level-one heading');
  if (token.type === 'html' && /<h[1-6][\s>]/i.test(token.raw))
    problems.push(`write headings in Markdown, not as HTML: ${token.raw.trim().split('\n')[0]}`);
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
