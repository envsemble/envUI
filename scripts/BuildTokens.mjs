// Builds envUI's design tokens: packages/ui/tokens (DTCG 2025.10 and its resolver) through
// Terrazzo into packages/ui/src/styles/Tokens.css, packages/ui/src/generated/tokens.ts,
// packages/ui/src/generated/tokens.json and packages/ui/src/generated/token-migration.json,
// formatted with Prettier. Terrazzo lints the tokens first. The migration map's copies follow it:
// the `tokens` section of the codemods' rename map, its fragment
// packages/codemods/src/maps/v1/tokens/Tokens.json, and the token list in docs/migration.md,
// between its token-migration markers.
//
//   node scripts/BuildTokens.mjs [--check]
//
// --check writes nothing and fails when a committed output differs from a fresh build, like
// `npm run icons:check`. The catalogue's and the test fixture's Vite servers rebuild on every token
// change through tokensVitePlugin(), so token edits hot-reload like any other library source.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isAbsolute, relative, resolve } from 'node:path';
import { build, defineConfig, Logger, parse } from '@terrazzo/parser';
import { format, resolveConfig } from 'prettier';
import { createConfig } from '../packages/ui/terrazzo.config.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const libraryDirectory = resolve(repositoryRoot, 'packages/ui');
export const tokensDirectory = resolve(libraryDirectory, 'tokens');
const configFile = pathToFileURL(resolve(libraryDirectory, 'terrazzo.config.mjs'));
export const codemodsMapFile = resolve(
  repositoryRoot,
  'packages/codemods/src/maps/v1/tokens/Tokens.json',
);
export const migrationGuideFile = resolve(repositoryRoot, 'docs/migration.md');

const mapComment =
  'Every custom property that envUI 0.x or 1.0’s development defined and 1.0 no longer does, with what replaces it: `to`, the 1.0 custom property, which v1-classes writes in its place (every token takes the --env- prefix, and a few names change beyond it), in a declaration only where no other name has the same `to` or it is the token’s own name, and reports otherwise; `value`, the color of a 0.7 fixed color that no token replaces, which v1-classes reports; or `removed`, with `to` what to use instead where there is one, which v1-classes also reports. A `note` says what changed beyond the name. `npm run tokens:build` writes this section from packages/ui/src/generated/token-migration.json.';

/** The `tokens` section of the codemods' rename map, from the token build's migration map. */
export function migrationMapSection(migration) {
  const section = { $comment: mapComment };
  for (const [name, entry] of Object.entries(migration.names))
    section[name] = {
      ...(entry.kind === 'removed'
        ? { removed: true, to: entry.cssVariable ?? null }
        : entry.kind === 'fixed'
          ? { value: entry.value }
          : { to: entry.cssVariable }),
      ...(entry.component && { component: entry.component }),
      ...(entry.colorPropertyOf && { colorPropertyOf: entry.colorPropertyOf }),
      ...(entry.note && { note: entry.note }),
    };
  return section;
}

/**
 * The text of the rename map's tokens fragment for `section`: one JSON object whose entries are each
 * written on one line, which Prettier keeps when it fits.
 */
export function mapFragmentText(section) {
  const entries = Object.entries(section).map(
    ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
  );
  return `{\n${entries.join(',\n')}\n}\n`;
}

const guideStart = '<!-- token-migration:start';
const guideEnd = '<!-- token-migration:end -->';

/**
 * The token list of the migration guide: the names that change beyond the prefix, the 0.7 aliases
 * with their replacements, the fixed colors, the removed names, and the names that only take the
 * prefix.
 */
export function migrationGuideList(migration) {
  const code = (name) => (name ? `\`${name}\`` : '—');
  const text = (value) => (value ?? '').replaceAll('|', '\\|');
  const table = (header, rows) =>
    [header, header.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`);
  const entries = Object.entries(migration.names);
  const of = (kind) => entries.filter(([, entry]) => entry.kind === kind);
  const theme = (name) =>
    name
      .replace(/^\w/, (letter) => letter.toUpperCase())
      .replace('-high-contrast', ', high contrast');
  /** A fixed value, or each value of a fixed color per theme, with the themes that take it. */
  const valueOf = (value) =>
    typeof value === 'string'
      ? code(value)
      : [...new Set(Object.values(value))]
          .map(
            (each) =>
              `${code(each)} (${Object.keys(value)
                .filter((name) => value[name] === each)
                .map((name) => theme(name).toLowerCase())
                .join('; ')})`,
          )
          .join(', ');
  const blocks = [];
  const renamed = of('renamed');
  if (renamed.length > 0)
    blocks.push(
      'Renamed beyond the prefix:',
      table(
        ['Before 1.0', '1.0', 'Note'],
        renamed.map(([name, entry]) => [code(name), code(entry.cssVariable), text(entry.note)]),
      ),
    );
  const aliases = of('alias');
  if (aliases.length > 0)
    blocks.push(
      'The 0.7 aliases, removed, each with the token that replaces it:',
      table(
        ['0.7 custom property', '1.0', 'Used for'],
        aliases.map(([name, entry]) => [
          code(name),
          code(entry.cssVariable),
          text(entry.component),
        ]),
      ),
    );
  const changed = aliases.filter(([, entry]) => entry.note);
  if (changed.length > 0)
    blocks.push(
      'Aliases whose replacement is not the 0.7 role, or whose value changed, so a style that relied on them needs a look:',
      table(
        ['0.7 custom property', '1.0', 'What changed'],
        changed.map(([name, entry]) => [code(name), code(entry.cssVariable), text(entry.note)]),
      ),
    );
  const fixed = of('fixed');
  if (fixed.length > 0)
    blocks.push(
      'Fixed colors, which no token replaces: write the value, or a custom property of your own that holds it.',
      table(
        ['0.7 custom property', 'Used for', 'Value'],
        fixed.map(([name, entry]) => [code(name), text(entry.component), valueOf(entry.value)]),
      ),
    );
  const removed = of('removed');
  if (removed.length > 0)
    blocks.push(
      'Removed, with what to use instead:',
      table(
        ['0.7 custom property', 'Use instead', 'Note'],
        removed.map(([name, entry]) => [code(name), code(entry.cssVariable), text(entry.note)]),
      ),
    );
  const prefixed = of('prefixed');
  if (prefixed.length > 0)
    blocks.push(
      `Every other name only takes the prefix, ${code(prefixed[0][0])} as ${code(prefixed[0][1].cssVariable)}: ${prefixed.map(([name]) => code(name)).join(', ')}.`,
    );
  return blocks.map((block) => (Array.isArray(block) ? block.join('\n') : block)).join('\n\n');
}

/** The migration guide's text with `list` between its token-migration markers. */
export function withGuideList(text, list) {
  const start = text.indexOf(guideStart);
  const startEnd = start === -1 ? -1 : text.indexOf('-->', start) + '-->'.length;
  const end = text.indexOf(guideEnd);
  if (start === -1 || end === -1 || end < startEnd)
    throw new Error(
      `${migrationGuideFile} needs the markers ${guideStart} … --> and ${guideEnd} around the token list.`,
    );
  return `${text.slice(0, startEnd)}\n\n${list}\n\n${text.slice(end)}`;
}

/** The codemods' rename map and the migration guide, with the token list of `migration`. */
export async function migrationCopies(migration) {
  const guide = await readFile(migrationGuideFile, 'utf8');
  return [
    { path: codemodsMapFile, contents: mapFragmentText(migrationMapSection(migration)) },
    { path: migrationGuideFile, contents: withGuideList(guide, migrationGuideList(migration)) },
  ];
}

/** `contents` as Prettier formats the file at `path`. */
export async function formatted(path, contents) {
  return format(contents, { ...(await resolveConfig(path)), filepath: path });
}

/**
 * Builds the tokens. With `check`, compares instead of writing and throws when anything is stale.
 * `tokensDirectory` and `outDir` (file URLs ending in a slash) build other tokens elsewhere, as
 * the tests do, and leave the codemods' rename map and the migration guide alone.
 */
export async function buildTokens({
  check = false,
  logger = new Logger({ level: 'warn' }),
  tokensDirectory,
  outDir,
} = {}) {
  // A fresh config per build, so a running dev server reads the token files anew.
  const rawConfig = createConfig({ tokensDirectory, outDir });
  const config = defineConfig(rawConfig, { cwd: new URL('./', configFile), logger });
  const sources = await Promise.all(
    config.tokens.map(async (filename) => ({ filename, src: await readFile(filename, 'utf8') })),
  );
  const parsed = await parse(sources, { config, logger });
  const result = await build(parsed.tokens, { ...parsed, config, logger });
  const outputs = result.outputFiles.map(({ filename, contents }) => ({
    path: fileURLToPath(new URL(filename, config.outDir)),
    contents,
  }));
  // The library's own tokens also bring the migration map's copies up to date.
  if (tokensDirectory === undefined && outDir === undefined) {
    const migration = outputs.find(({ path }) => path.endsWith('token-migration.json'));
    outputs.push(...(await migrationCopies(JSON.parse(migration.contents))));
  }
  const stale = [];
  for (const { path, contents } of outputs) {
    const text = await formatted(path, contents);
    const existing = await readFile(path, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (existing === text) continue;
    stale.push(relative(repositoryRoot, path).replaceAll('\\', '/'));
    // Unchanged files keep their timestamps, so watchers don't reload for nothing.
    if (!check) {
      await mkdir(resolve(path, '..'), { recursive: true });
      await writeFile(path, text);
    }
  }
  if (check && stale.length > 0)
    throw new Error(
      `Generated tokens are stale: ${stale.join(', ')}. Run \`npm run tokens:build\` and commit the result.`,
    );
  return { tokenCount: Object.keys(parsed.tokens).length, files: outputs.length, stale };
}

/**
 * A Vite plugin that builds the tokens when the server or build starts and again whenever a file in
 * packages/ui/tokens changes; Vite then hot-reloads the regenerated Tokens.css.
 */
export function tokensVitePlugin() {
  // One build at a time: a burst of edits rebuilds in order, and the last build wins.
  let queue = Promise.resolve();
  return {
    name: 'envui-tokens',
    async buildStart() {
      await buildTokens();
    },
    configureServer(server) {
      server.watcher.add(tokensDirectory);
      server.watcher.on('all', (event, path) => {
        const contained = relative(tokensDirectory, path);
        if (
          contained.startsWith('..') ||
          isAbsolute(contained) ||
          !['add', 'change', 'unlink'].includes(event)
        )
          return;
        queue = queue
          .then(() => buildTokens())
          .catch((error) => server.config.logger.error(String(error.message ?? error)));
      });
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  if (process.argv.slice(2).some((argument) => argument !== '--check'))
    throw new Error('Usage: BuildTokens.mjs [--check]');
  const { tokenCount, files, stale } = await buildTokens({ check });
  console.log(
    check
      ? `Verified ${files} generated token files from ${tokenCount} tokens.`
      : `Built ${tokenCount} tokens into ${files} files${stale.length ? ` (updated ${stale.join(', ')})` : ' (unchanged)'}.`,
  );
}
