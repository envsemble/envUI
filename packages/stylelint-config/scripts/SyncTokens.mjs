// Rewrites data/tokens.json, the envUI tokens the config's messages name, from the library's
// generated token list (packages/ui/src/generated/tokens.json). It runs before every pack, so a
// published config names the tokens of its own envUI release; without the library, as in a copy of
// the package outside the repository, the config's own copy in data/tokens.json is kept.
//
//   node scripts/SyncTokens.mjs           update the copy from the library's token list
//   node scripts/SyncTokens.mjs --check   fail when the copy differs from the library's token list

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const libraryTokensUrl = new URL('../../ui/src/generated/tokens.json', import.meta.url);
export const tokensUrl = new URL('../data/tokens.json', import.meta.url);

const comment =
  "The custom properties of envUI's public tokens, by DTCG type, that the config's messages suggest. scripts/SyncTokens.mjs rewrites this file from the library's generated token list (packages/ui/src/generated/tokens.json) whenever it exists, before every pack; source says where the names came from.";

/** The custom properties of a token list's public tokens by type, without deprecated ones. */
export function summarizeTokens(list) {
  const types = {};
  for (const token of list.tokens) {
    if (token.deprecated) continue;
    (types[token.type] ??= []).push(token.cssVariable);
  }
  return Object.fromEntries(
    Object.keys(types)
      .sort()
      .map((type) => [type, types[type].sort()]),
  );
}

/**
 * The text of data/tokens.json for the given names, laid out as Prettier formats it: a type's
 * names on one line when they fit the repository's print width, else one per line.
 */
export function serializeTokens(types, source) {
  const json = (value) => JSON.stringify(value);
  const lines = ['{', `  "$comment": ${json(comment)},`, `  "source": ${json(source)},`];
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

/** The text data/tokens.json should have, or undefined when the library's list is absent. */
export function expectedTokens() {
  if (!existsSync(libraryTokensUrl)) return undefined;
  const list = JSON.parse(readFileSync(libraryTokensUrl, 'utf8'));
  return serializeTokens(summarizeTokens(list), 'packages/ui/src/generated/tokens.json');
}

function main() {
  const check = process.argv.includes('--check');
  const current = readFileSync(tokensUrl, 'utf8');
  const expected = expectedTokens();
  const count = (text) =>
    Object.values(JSON.parse(text).tokens).reduce((sum, names) => sum + names.length, 0);
  if (expected === undefined) {
    console.log(
      `No token list at ${fileURLToPath(libraryTokensUrl)}; keeping the config's own copy (${count(current)} tokens).`,
    );
    return;
  }
  if (expected === current) {
    console.log(`data/tokens.json matches the library's token list (${count(current)} tokens).`);
    return;
  }
  if (check) {
    console.error(
      "data/tokens.json differs from the library's token list. Run npm run sync:tokens --workspace @envsemble/stylelint-config-envui.",
    );
    process.exitCode = 1;
    return;
  }
  writeFileSync(tokensUrl, expected);
  console.log(
    `Updated data/tokens.json from the library's token list (${count(expected)} tokens).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
