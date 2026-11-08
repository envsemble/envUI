// What the site shows of a part of a page before the part loads: the outlines its skeletons are
// drawn from (apps/site/src/loading/Skeletons.tsx), small enough to come with the page. The site
// reads them when it builds or serves, through the virtual modules in apps/site/vite.config.ts, so
// they always match the files they outline.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { examplesDirectory } from '../docs/GenerateDocumentation.ts';
import {
  groupOf,
  themes,
  tokenGroups,
  tokenValueText,
} from '../../apps/site/src/pages/TokenGroups.ts';

const changelogFile = fileURLToPath(new URL('../../packages/ui/CHANGELOG.md', import.meta.url));
const tokensFile = fileURLToPath(
  new URL('../../packages/ui/src/generated/tokens.json', import.meta.url),
);

/** The lines of each example's code, by page/Name, as its code block shows it. */
export function readExampleLines(): Record<string, number> {
  const lines: Record<string, number> = {};
  for (const page of readdirSync(examplesDirectory, { withFileTypes: true })) {
    if (!page.isDirectory()) continue;
    for (const file of readdirSync(`${examplesDirectory}/${page.name}`)) {
      if (!file.endsWith('.tsx')) continue;
      const source = readFileSync(`${examplesDirectory}/${page.name}/${file}`, 'utf8');
      lines[`${page.name}/${file.slice(0, -4)}`] = source
        .replace(/\r?\n$/, '')
        .split(/\r?\n/).length;
    }
  }
  return lines;
}
export const exampleLinesSources = [examplesDirectory];

/** The length of a line of Markdown as the reader sees it, without links' addresses or markup. */
const shownLength = (text: string) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim().length;

/**
 * The shape of Markdown: its headings, blank lines, lists and code fences as they are, and the text
 * of every other line as ~N, its length, which the skeleton writes out as placeholder words.
 */
export function markdownShape(markdown: string) {
  let fenced = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (!line.trim() || (!fenced && /^#{1,6} /.test(line))) return line;
      const [, indent, marker = '', text] = /^(\s*)((?:[-*+]|\d+\.)\s+)?(.*)$/.exec(line)!;
      return `${indent}${marker}~${shownLength(text)}`;
    })
    .join('\n');
}

/**
 * The changelog as the Docs' Changelog page shows it, a level lower under Every change: each
 * release's heading, which the page's contents list from the start, and the shape of what it says.
 */
export function readChangelogOutline(file = changelogFile) {
  const changelog = readFileSync(file, 'utf8')
    .replace(/\r\n?/g, '\n')
    .replace(/^# [^\n]*\n+/, '')
    .replace(/^(#{2,5}) /gm, '#$1 ');
  return changelog
    .split(/^(?=### )/m)
    .filter((release) => release.startsWith('### '))
    .map((release) => {
      const [heading, ...body] = release.split('\n');
      return { heading: heading, shape: markdownShape(body.join('\n').trim()) };
    });
}
export const changelogOutlineSources = [changelogFile];

/** The length of a token's value as the reference shows it. */
function valueLength(value: { resolved?: unknown } | undefined, color: boolean) {
  const text = tokenValueText(value?.resolved);
  // A color's swatch takes about two characters' room before it.
  return text.length + (color ? 2 : 0);
}

interface Token {
  id: string;
  cssVariable: string;
  type: string;
  description?: string;
  values: Record<string, { resolved?: unknown } | undefined>;
  scales?: { compact?: { resolved?: unknown } };
}

/**
 * The token reference's groups, each with its title and a row for each token: its name, the length
 * of its description, and the length of each value it shows.
 */
export function readTokenOutline(file = tokensFile) {
  const { tokens } = JSON.parse(readFileSync(file, 'utf8')) as { tokens: Token[] };
  return tokenGroups.flatMap((group) => {
    const members = tokens.filter((token) => groupOf(token) === group);
    if (!members.length) return [];
    const colors = members[0].type === 'color';
    return [
      {
        title: group.title,
        colors,
        rows: members.map((token) => [
          token.cssVariable,
          token.description?.length ?? 0,
          ...(colors
            ? themes.map(([theme]) => valueLength(token.values[theme], true))
            : [
                valueLength(token.values.light, false),
                valueLength(token.scales?.compact ?? token.values.light, false),
              ]),
        ]),
      },
    ];
  });
}
export const tokenOutlineSources = [tokensFile];
