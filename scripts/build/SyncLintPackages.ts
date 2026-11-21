import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { libraryEntryPoints } from '../docs/LibraryEntryPoints.ts';
import { GeneratedOutput } from './GeneratedFiles.ts';
import { partsFile, repositoryPath, repositoryRoot } from '../RepositoryPaths.ts';

const libraryTokens = 'packages/ui/src/generated/tokens.json';
const libraryTokenStyles = 'packages/ui/src/generated/Tokens.css';
const handwrittenTokens = 'packages/ui/tokens/handwritten.json';
const libraryParts = repositoryPath(partsFile);
const writingGuide = 'docs/writing.md';

const copiedModules = {
  'tokens.js': 'scripts/build/LintPackageTokens.js',
  'colorPolicy.js': 'scripts/build/LintPackageColorPolicy.js',
};

export const lintPackages = {
  '@envsemble/eslint-plugin-envui': 'packages/eslint-plugin/src',
  '@envsemble/stylelint-config-envui': 'packages/stylelint-config/src',
};

const entryPointsComment = `The specifiers of envUI's entry points, whose exports no-html-elements counts as envUI's. scripts/build/SyncLintPackages.ts writes this file from the exports of packages/ui/package.json before every pack.`;

const tokensComment = `The custom properties of envUI's public tokens, by DTCG type, that the package's messages suggest. scripts/build/SyncLintPackages.ts writes this file from the library's generated token list (${libraryTokens}) before every pack; source says where the names came from.`;

const vocabularyComment = `The words envui/label-vocabulary reports in a label, each with the word to write instead. scripts/build/SyncLintPackages.ts writes this file from the vocabulary table of ${writingGuide} before every pack, leaving out the words the table qualifies, those that are a word of the table themselves and those it lists under two words.`;

const customPropertiesComment = `Every --env-* custom property envUI defines: its tokens, its handwritten tokens and the public colour properties and properties of its components. envui/no-unknown-custom-properties reports any other. scripts/build/SyncLintPackages.ts writes this file from the sources below before every pack.`;

const scalesComment = `envUI's spacing and radius steps at the default scale, smallest first, which envui/no-off-scale-values names. A step whose value is not a length is a calculation, such as the full corner of a pill. scripts/build/SyncLintPackages.ts writes this file from the library's generated token list before every pack.`;

interface Token {
  id: string;
  type: string;
  cssVariable: string;
  deprecated?: unknown;
  values: Record<string, { css: string; resolved: string }>;
}

interface TokenList {
  tokens: Token[];
}

type PublicProperties = { colors?: { property: string }[]; properties?: { property: string }[] };

interface PartsData {
  components: Record<string, PublicProperties>;
  shared?: Record<string, PublicProperties>;
}

function summarizeTokens(list: TokenList) {
  const types: Record<string, string[]> = {};
  for (const token of list.tokens) {
    if (token.deprecated) continue;
    (types[token.type] ??= []).push(token.cssVariable);
  }
  return Object.fromEntries(
    Object.keys(types)
      .sort()
      .map((type) => [type, types[type]!.sort()]),
  );
}

const printWidth = 100;

function jsonAsPrettierFormatsItExpanded(value: unknown) {
  const json = (item: unknown) => JSON.stringify(item);
  const print = (item: unknown, indent: string, prefix: string, suffix: string): string[] => {
    if (Array.isArray(item)) {
      const line = `${indent}${prefix}[${item.map(json).join(', ')}]${suffix}`;
      if (line.length <= printWidth || item.length === 0) return [line];
      return [
        `${indent}${prefix}[`,
        ...item.map(
          (element, index) => `${indent}  ${json(element)}${index < item.length - 1 ? ',' : ''}`,
        ),
        `${indent}]${suffix}`,
      ];
    }
    if (item !== null && typeof item === 'object') {
      const entries = Object.entries(item);
      if (entries.length === 0) return [`${indent}${prefix}{}${suffix}`];
      return [
        `${indent}${prefix}{`,
        ...entries.flatMap(([key, member], index) =>
          print(member, `${indent}  `, `${json(key)}: `, index < entries.length - 1 ? ',' : ''),
        ),
        `${indent}}${suffix}`,
      ];
    }
    return [`${indent}${prefix}${json(item)}${suffix}`];
  };
  return `${print(value, '', '', '').join('\n')}\n`;
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());

interface VocabularyRow {
  word: string;
  means: string;
  not: { text: string; qualified: boolean }[];
}

function vocabularyRows(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const section = lines.findIndex((line) => /^##\s+Buttons and actions\s*$/.test(line));
  if (section === -1) throw new Error(`${writingGuide} has no "Buttons and actions" section.`);
  const header = lines.findIndex(
    (line, index) =>
      index > section && line.trim().startsWith('|') && cells(line).join('|') === 'Word|Means|Not',
  );
  if (header === -1) throw new Error(`${writingGuide} has no Word | Means | Not table.`);
  const rows: VocabularyRow[] = [];
  for (const line of lines.slice(header + 2)) {
    if (!line.trim().startsWith('|')) break;
    const [word = '', means = '', not = ''] = cells(line);
    const entries: VocabularyRow['not'] = [];
    let group: VocabularyRow['not'] = [];
    for (const piece of not.split(/,\s*/)) {
      if (/^[a-z]/.test(piece)) {
        for (const entry of group) entry.qualified = true;
        continue;
      }
      const text = piece.replace(/\s*\(.*\)\s*$/, '').trim();
      group = text
        .split(/\s+or\s+/)
        .filter(Boolean)
        .map((alternative) => ({ text: alternative, qualified: text !== piece.trim() }));
      entries.push(...group);
    }
    rows.push({ word, means, not: entries });
  }
  return rows;
}

export function parseVocabulary(markdown: string) {
  const rows = vocabularyRows(markdown);
  const key = (text: string) => text.toLowerCase();
  const tableWords = new Set(rows.map(({ word }) => key(word)));
  const rowCount = new Map<string, number>();
  for (const row of rows)
    for (const { text } of row.not) rowCount.set(key(text), (rowCount.get(key(text)) ?? 0) + 1);
  const lastWord = (text: string) => key(text).split(/\s+/).at(-1);
  const words: Record<string, string> = {};
  for (const { word, means, not } of rows)
    for (const { text, qualified } of not) {
      if (qualified || tableWords.has(key(text)) || rowCount.get(key(text))! > 1) continue;
      const counterpart = [...means.matchAll(/"([^"]+)"/g)]
        .map(([, quoted]) => quoted!)
        .find(
          (quoted) => lastWord(quoted) === lastWord(text) && lastWord(quoted) !== lastWord(word),
        );
      words[text] = counterpart ?? word;
    }
  return words;
}

function definedCustomProperties(
  list: TokenList,
  tokenStyles: string,
  handwritten: object,
  parts: PartsData,
) {
  const names = new Set(list.tokens.map((token) => token.cssVariable));
  for (const [, name] of tokenStyles.matchAll(/(--env-[\w-]+)\s*:/g)) names.add(name!);
  for (const id of Object.keys(handwritten))
    if (!id.startsWith('$')) names.add(`--env-${id.replaceAll('.', '-')}`);
  const components = [...Object.values(parts.components), ...Object.values(parts.shared ?? {})];
  for (const component of components)
    for (const { property } of [...(component.colors ?? []), ...(component.properties ?? [])])
      names.add(property);
  return [...names].filter((name) => name.startsWith('--env-')).sort();
}

const remLength = (css: string) =>
  /^-?(?:\d+\.?\d*|\.\d+)rem$/.test(css) ? Number.parseFloat(css) : Number.POSITIVE_INFINITY;

function scaleSteps(list: TokenList) {
  const steps = (group: string) =>
    Object.fromEntries(
      list.tokens
        .filter((token) => token.id.startsWith(`${group}.`) && !token.deprecated)
        .map((token) => [token.cssVariable, Object.values(token.values)[0]!.css.trim()] as const)
        .filter(([, css]) => !css.startsWith('var('))
        .sort(([, a], [, b]) => remLength(a) - remLength(b)),
    );
  return { space: steps('space'), radius: steps('radius') };
}

const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');

export function expectedFiles(): Map<string, string> {
  const tokenList = JSON.parse(read(libraryTokens)) as TokenList;
  const tokens = jsonAsPrettierFormatsItExpanded({
    $comment: tokensComment,
    source: libraryTokens,
    tokens: summarizeTokens(tokenList),
  });
  const copies = Object.entries(copiedModules).map(
    ([name, source]) => [name, read(source)] as const,
  );
  const files = new Map<string, string>();
  for (const directory of Object.values(lintPackages)) {
    files.set(`${directory}/data/tokens.json`, tokens);
    for (const [name, copy] of copies) files.set(`${directory}/${name}`, copy);
  }
  const eslintPlugin = lintPackages['@envsemble/eslint-plugin-envui'];
  const stylelintConfig = lintPackages['@envsemble/stylelint-config-envui'];
  const entryPoints = libraryEntryPoints().map(({ specifier }) => specifier);
  files.set(
    `${eslintPlugin}/data/entryPoints.json`,
    `${JSON.stringify({ $comment: entryPointsComment, entryPoints }, null, 2)}\n`,
  );
  files.set(
    `${eslintPlugin}/data/vocabulary.json`,
    jsonAsPrettierFormatsItExpanded({
      $comment: vocabularyComment,
      source: writingGuide,
      words: parseVocabulary(read(writingGuide)),
    }),
  );
  files.set(
    `${stylelintConfig}/data/customProperties.json`,
    jsonAsPrettierFormatsItExpanded({
      $comment: customPropertiesComment,
      sources: [libraryTokens, libraryTokenStyles, handwrittenTokens, libraryParts],
      names: definedCustomProperties(
        tokenList,
        read(libraryTokenStyles),
        JSON.parse(read(handwrittenTokens)) as object,
        JSON.parse(read(libraryParts)) as PartsData,
      ),
    }),
  );
  files.set(
    `${stylelintConfig}/data/scales.json`,
    jsonAsPrettierFormatsItExpanded({
      $comment: scalesComment,
      source: libraryTokens,
      ...scaleSteps(tokenList),
    }),
  );
  return files;
}

export function staleFiles() {
  return [...expectedFiles()]
    .filter(([path, text]) => !existsSync(resolve(repositoryRoot, path)) || read(path) !== text)
    .map(([path]) => path);
}

function main() {
  const check = process.argv.includes('--check');
  const output = new GeneratedOutput({ check, regenerate: 'npm run tokens:build' });
  for (const [path, contents] of expectedFiles())
    output.writeOrCheck(resolve(repositoryRoot, path), contents);
  output.exitIfStale();
  console.log(
    check
      ? "The lint packages' shared files match their sources."
      : output.changed.length
        ? `Updated ${output.changed.join(', ')}.`
        : `The lint packages' shared files already match their sources.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
