// Writes the files the lint packages share, into each package's src/: data/tokens.json, the envUI
// tokens their messages name, from the library's generated token list
// (packages/ui/src/generated/tokens.json); tokens.js, the helper that reads it, from
// scripts/build/LintPackageTokens.js; and colorPolicy.js, what both count as a raw color, from
// scripts/build/LintPackageColorPolicy.js. Each package ships its own copies, so it works on its
// own once installed; a published package names the tokens of its own envUI release, as each
// pack runs this first.
//
//   node scripts/build/SyncLintPackages.ts           write the copies
//   node scripts/build/SyncLintPackages.ts --check   fail when a copy differs from its source

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const repository = new URL('../../', import.meta.url);
const libraryTokens = 'packages/ui/src/generated/tokens.json';
/** The modules each lint package ships a copy of, by their name in the package. */
const copiedModules = {
  'tokens.js': 'scripts/build/LintPackageTokens.js',
  'colorPolicy.js': 'scripts/build/LintPackageColorPolicy.js',
};

/** Where each lint package keeps its copied modules, with data/tokens.json beside them. */
export const lintPackages = {
  '@envsemble/eslint-plugin-envui': 'packages/eslint-plugin/src',
  '@envsemble/stylelint-config-envui': 'packages/stylelint-config/src',
};

const comment = `The custom properties of envUI's public tokens, by DTCG type, that the package's messages suggest. scripts/build/SyncLintPackages.ts writes this file from the library's generated token list (${libraryTokens}) before every pack; source says where the names came from.`;

interface TokenList {
  tokens: { type: string; cssVariable: string; deprecated?: unknown }[];
}

/** The custom properties of a token list's public tokens by type, without deprecated ones. */
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

/**
 * The text of data/tokens.json for the given names, laid out as Prettier formats it: a type's
 * names on one line when they fit the repository's print width, else one per line.
 */
function serializeTokens(types: Record<string, string[]>) {
  const json = (value: unknown) => JSON.stringify(value);
  const lines = ['{', `  "$comment": ${json(comment)},`, `  "source": ${json(libraryTokens)},`];
  lines.push('  "tokens": {');
  Object.entries(types).forEach(([type, names], index, entries) => {
    const comma = index < entries.length - 1 ? ',' : '';
    const line = `    ${json(type)}: [${names.map(json).join(', ')}]${comma}`;
    if (line.length <= 100) lines.push(line);
    else
      lines.push(
        `    ${json(type)}: [`,
        ...names.map(
          (name, position) => `      ${json(name)}${position < names.length - 1 ? ',' : ''}`,
        ),
        `    ]${comma}`,
      );
  });
  lines.push('  }', '}', '');
  return lines.join('\n');
}

const read = (path: string) => readFileSync(new URL(path, repository), 'utf8');

/** Each file the lint packages ship from a source, by its path in the repository, with its text. */
export function expectedFiles(): Map<string, string> {
  const tokens = serializeTokens(summarizeTokens(JSON.parse(read(libraryTokens)) as TokenList));
  const copies = Object.entries(copiedModules).map(([name, source]) => {
    const copy = `// Generated from ${source} by npm run tokens:build; edit that file.\n${read(source)}`;
    return [name, copy] as const;
  });
  const files = new Map<string, string>();
  for (const directory of Object.values(lintPackages)) {
    files.set(`${directory}/data/tokens.json`, tokens);
    for (const [name, copy] of copies) files.set(`${directory}/${name}`, copy);
  }
  return files;
}

/** The copies that differ from their sources, or are missing. */
export function staleFiles() {
  return [...expectedFiles()]
    .filter(([path, text]) => !existsSync(new URL(path, repository)) || read(path) !== text)
    .map(([path]) => path);
}

function main() {
  const check = process.argv.includes('--check');
  const stale = staleFiles();
  if (check) {
    if (stale.length) {
      console.error(`${stale.join(', ')} differ from their sources. Run npm run tokens:build.`);
      process.exitCode = 1;
    } else console.log("The lint packages' shared files match their sources.");
    return;
  }
  const expected = expectedFiles();
  for (const path of stale) writeFileSync(new URL(path, repository), expected.get(path)!);
  console.log(
    stale.length
      ? `Updated ${stale.join(', ')}.`
      : `The lint packages' shared files already match their sources.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
