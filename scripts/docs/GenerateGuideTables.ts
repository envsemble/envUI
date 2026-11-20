import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatted, GeneratedOutput, readIfExists } from '../build/GeneratedFiles.ts';
import { documentationDirectory, partsFile, tokensDataFile } from '../RepositoryPaths.ts';
import { cell } from './MarkdownBlocks.ts';
import type { PartsContract } from './parts/Contract.ts';

type Entry = PartsContract['components'][string];

interface Token {
  id: string;
  cssVariable: string;
  type: string;
  description?: string;
  values: Record<string, { css: unknown; resolved: unknown }>;
  scales?: Record<string, { css: unknown; resolved: unknown }>;
}

interface TokenGroup {
  title: string;
  ids: string[];
  byValue?: boolean;
}

const matches = (id: string, pattern: string) =>
  pattern.endsWith('.') || pattern.endsWith('*')
    ? id.startsWith(pattern.replace(/\*$/, ''))
    : id === pattern;

const foundationTables: Record<string, TokenGroup[]> = {
  'foundations/colors.md': [
    { title: 'Backgrounds', ids: ['color.bg.'] },
    { title: 'Text and icons', ids: ['color.fg.'] },
    { title: 'Borders', ids: ['color.border.'] },
    { title: 'Elevation', ids: ['elevation.'] },
    { title: 'State layers', ids: ['state.'] },
  ],
  'foundations/typography.md': [
    { title: 'Text styles', ids: ['type.'] },
    { title: 'Font sizes', ids: ['font.size.'] },
    { title: 'Typeface and weights', ids: ['font.family', 'font.weight.', 'line-height.'] },
  ],
  'foundations/spacing.md': [
    { title: 'Spacing', ids: ['space.'] },
    { title: 'Corners', ids: ['radius.'] },
    { title: 'Controls', ids: ['control.'] },
    { title: 'Rows', ids: ['row.', 'tree.'] },
    { title: 'Pictures and counts', ids: ['picture.', 'badge-count.'] },
  ],
  'foundations/responsive.md': [
    { title: 'Window classes', ids: ['window-class.'], byValue: true },
    {
      title: 'Layout',
      ids: [
        'page.',
        'navigation-rail.',
        'navigation-drawer.',
        'panes.',
        'sheet.',
        'dialog.',
        'top-bar.',
        'title-bar.',
        'viewport-gutter',
      ],
    },
    { title: 'Stacking order', ids: ['z.'], byValue: true },
  ],
  'foundations/icons.md': [{ title: 'Icon sizes', ids: ['icon.'] }],
  'foundations/accessibility.md': [{ title: 'Motion', ids: ['motion.'] }],
};

const lineUpTokens: TokenGroup = {
  title: 'Tokens to line up with',
  ids: [
    'page.',
    'navigation-rail.',
    'navigation-drawer.',
    'panes.',
    'sheet.',
    'top-bar.',
    'title-bar.',
    'viewport-gutter',
    'control.height*',
    'icon.size',
  ],
};

function readTokens(): Token[] {
  return JSON.parse(readFileSync(tokensDataFile, 'utf8')).tokens;
}

function tokenValue(tokens: Map<string, Token>, token: Token, scale: string): string {
  const own = scale === 'compact' ? token.scales?.compact?.css : undefined;
  const value = own ?? token.values.light.css;
  const resolveVars = (text: string) =>
    text.replace(/var\((--env-[\w-]+)\)/g, (whole, name: string) => {
      const target = tokens.get(name);
      return target ? tokenValue(tokens, target, scale) : whole;
    });
  if (typeof value === 'string') return resolveVars(value);
  const parts = value as Record<string, string>;
  const size = resolveVars(parts['font-size'] ?? '');
  const weight = resolveVars(parts['font-weight'] ?? '');
  return `${weight} ${size} / ${parts['line-height'] ?? ''}`.trim();
}

function colorValue(token: Token, theme: string) {
  return String(token.values[theme]?.resolved ?? '');
}

function tokenTable(tokens: Token[], group: TokenGroup) {
  const byName = new Map(tokens.map((token) => [token.cssVariable, token]));
  const rows = tokens.filter((token) => group.ids.some((id) => matches(token.id, id)));
  if (!rows.length) throw new Error(`No token matches the table ${group.title}.`);
  if (group.byValue)
    rows.sort(
      (a, b) =>
        parseFloat(String(a.values.light.resolved)) - parseFloat(String(b.values.light.resolved)),
    );
  const colors = rows.every((token) => token.type === 'color');
  const header = colors
    ? '| Token | Light | Dark | Use |\n| --- | --- | --- | --- |'
    : '| Token | Comfortable | Compact | Use |\n| --- | --- | --- | --- |';
  const code = (text: string) => (text ? `\`${cell(text)}\`` : '');
  const lines = rows.map((token) => {
    const values = colors
      ? [colorValue(token, 'light'), colorValue(token, 'dark')]
      : [tokenValue(byName, token, 'comfortable'), tokenValue(byName, token, 'compact')];
    return `| \`${token.cssVariable}\` | ${values.map(code).join(' | ')} | ${cell(token.description ?? '')} |`;
  });
  return `${header}\n${lines.join('\n')}`;
}

function foundationSection(tokens: Token[], groups: TokenGroup[]) {
  const tables = groups.map((group) => `#### ${group.title}\n\n${tokenTable(tokens, group)}`);
  const sized = tables.some((table) => table.includes('| Comfortable | Compact |'));
  return `${sized ? 'Values at the default 16 px root.\n\n' : ''}${tables.join('\n\n')}`;
}

function unplacedTokens(tokens: Token[]) {
  const patterns = Object.values(foundationTables).flatMap((groups) =>
    groups.flatMap((group) => group.ids),
  );
  return tokens
    .filter((token) => patterns.filter((id) => matches(token.id, id)).length !== 1)
    .map((token) => token.id);
}

const code = (text: string) => `\`${text}\``;

function stateText(state: Entry['states'][number], root: string | null) {
  const values = state.values.filter(Boolean);
  const on =
    state.parts.length === 1 && state.parts[0] === root
      ? ''
      : ` on ${state.parts.map(code).join(', ')}`;
  return `${code(state.attribute)}${values.length ? ` (${values.map(code).join(', ')})` : ''}${on}`;
}

function contractOf(name: string, entry: Entry, heading: string) {
  const lines = [
    `- Parts: ${entry.parts.map((part) => `${code(part.class)}${part.slot ? ' (slot)' : ''}`).join(', ')}`,
  ];
  if (entry.states.length)
    lines.push(`- States: ${entry.states.map((state) => stateText(state, entry.root)).join('; ')}`);
  if (entry.colors?.length)
    lines.push(
      `- Color properties: ${entry.colors.map((color) => code(color.property)).join(', ')}`,
    );
  for (const property of entry.properties ?? [])
    lines.push(`- ${code(property.property)}, to ${property.use}: ${property.description}`);
  if (entry.usedBy?.length) lines.push(`- Used by: ${entry.usedBy.join(', ')}`);
  return `${heading} ${name}\n\n${lines.join('\n')}`;
}

function componentsSection(parts: PartsContract) {
  return Object.entries(parts.components)
    .filter(([, entry]) => entry.parts.length)
    .map(([name, entry]) => contractOf(name, entry, '###'))
    .join('\n\n');
}

function sharedSection(parts: PartsContract) {
  return Object.entries(parts.shared)
    .map(([name, entry]) => contractOf(name, entry, '###'))
    .join('\n\n');
}

function generatedSections(tokens = readTokens()): Record<string, Record<string, string>> {
  const parts: PartsContract = JSON.parse(readFileSync(partsFile, 'utf8'));
  const sections: Record<string, Record<string, string>> = {
    'customizing.md': {
      '## Components': componentsSection(parts),
      '## Shared parts': sharedSection(parts),
      [`## ${lineUpTokens.title}`]: tokenTable(tokens, lineUpTokens),
    },
  };
  for (const [page, groups] of Object.entries(foundationTables))
    sections[page] = { '### Customize': foundationSection(tokens, groups) };
  return sections;
}

function replaceSection(markdown: string, heading: string, body: string) {
  const depth = heading.indexOf(' ');
  const lines = markdown.split('\n');
  const start = lines.indexOf(heading);
  if (start === -1) throw new Error(`no heading "${heading}"`);
  let end = lines.length;
  let fenced = false;
  for (let index = start + 1; index < lines.length; index++) {
    if (/^\s*(```|~~~)/.test(lines[index])) fenced = !fenced;
    const level = /^(#{1,6})\s/.exec(lines[index])?.[1].length;
    if (!fenced && level && level <= depth) {
      end = index;
      break;
    }
  }
  return [...lines.slice(0, start + 1), '', body, '', ...lines.slice(end)].join('\n');
}

if (import.meta.main) {
  const check = process.argv.includes('--check');
  const tokens = readTokens();
  const unplaced = unplacedTokens(tokens);
  if (unplaced.length) {
    console.error(
      `Each token belongs to one table of foundationTables in scripts/docs/GenerateGuideTables.ts; these are in none or several: ${unplaced.join(', ')}.`,
    );
    process.exit(1);
  }
  const generated = new GeneratedOutput({ check, regenerate: 'npm run docs:guides' });
  for (const [page, sections] of Object.entries(generatedSections(tokens))) {
    const file = resolve(documentationDirectory, page);
    const current = readIfExists(file) ?? '';
    let markdown = current.replace(/\r\n/g, '\n');
    for (const [heading, body] of Object.entries(sections)) {
      try {
        markdown = replaceSection(markdown, heading, body);
      } catch (error) {
        console.error(
          `docs/${page}: ${(error as Error).message}; the generated tables go under it.`,
        );
        process.exit(1);
      }
    }
    generated.writeOrCheck(file, await formatted(file, markdown));
  }
  generated.exitIfStale();
  console.log(
    check
      ? 'The generated tables of the guides match their sources.'
      : `Generated the tables of the guides${generated.changed.length ? `: ${generated.changed.join(', ')}` : ''}.`,
  );
}
