// Builds envUI's design tokens: packages/ui/tokens (DTCG 2025.10 and its resolver) through
// Terrazzo into packages/ui/src/styles/Tokens.css, packages/ui/src/generated/tokens.ts,
// packages/ui/src/generated/tokens.json and packages/ui/src/generated/token-migration.json,
// formatted with Prettier. Terrazzo lints the tokens first. The migration map's copies follow it:
// the `tokens` section of the codemods' rename map (packages/codemods/src/maps/v1.json) and the
// token list in docs/migration.md, between its token-migration markers.
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
export const codemodsMapFile = resolve(repositoryRoot, 'packages/codemods/src/maps/v1.json');
export const migrationGuideFile = resolve(repositoryRoot, 'docs/migration.md');

const mapComment =
  'The 0.7 custom properties of the tokens, each with what replaces it in 1.0: `to`, the custom property of the one role that replaces it; `byTheme`, the custom property of the role a component token takes in each theme, which no one name replaces; `primitive`, the palette color of a fixed color, which no role replaces; or `removed`, with `to` its replacement where there is one and a `note`. The 0.7 names remain as aliases of their roles until the CSS-architecture step, which gives every token the --env- prefix. `npm run tokens:build` writes this section from packages/ui/src/generated/token-migration.json; the transforms do not read it yet.';

/** The `tokens` section of the codemods' rename map, from the token build's migration map. */
export function migrationMapSection(migration) {
  const section = { $comment: mapComment };
  for (const [name, entry] of Object.entries(migration.names))
    section[name] = entry.removed
      ? { removed: true, to: entry.cssVariable ?? null, note: entry.note }
      : {
          ...(entry.primitive
            ? { primitive: entry.primitive }
            : entry.cssVariables
              ? { byTheme: entry.cssVariables }
              : { to: entry.cssVariable }),
          ...(entry.component && { component: entry.component }),
        };
  return section;
}

/**
 * The rename map's text with `section` as its `tokens` section, in place of the one it has or at
 * the end. The map is formatted with Prettier, so a top-level section starts on the line
 * `  "tokens": {` and ends on the next line that is `  }` or `  },`. Each entry is written on one
 * line, which Prettier keeps when it fits.
 */
export function withMapSection(text, section) {
  const lines = text.split('\n');
  const entries = Object.entries(section).map(
    ([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
  );
  const written = (comma) => ['  "tokens": {', entries.join(',\n'), `  }${comma}`];
  const start = lines.indexOf('  "tokens": {');
  if (start === -1) {
    const end = lines.lastIndexOf('}');
    if (end < 1 || lines[end - 1] !== '  }')
      throw new Error(`${codemodsMapFile} does not end with a section that the tokens can follow.`);
    lines.splice(end - 1, 1, '  },', ...written(''));
  } else {
    const end = lines.findIndex((line, index) => index > start && /^ {2}\},?$/.test(line));
    if (end === -1) throw new Error(`The tokens section of ${codemodsMapFile} does not end.`);
    lines.splice(start, end - start + 1, ...written(lines[end].endsWith(',') ? ',' : ''));
  }
  return lines.join('\n');
}

const guideStart = '<!-- token-migration:start';
const guideEnd = '<!-- token-migration:end -->';

/** The token list of the migration guide: the removed names, and what replaces each of the rest. */
export function migrationGuideList(migration) {
  const code = (name) => (name ? `\`${name}\`` : '—');
  const text = (value) => (value ?? '').replaceAll('|', '\\|');
  const table = (header, rows) =>
    [header, header.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`);
  const entries = Object.entries(migration.names);
  const removed = entries.filter(([, entry]) => entry.removed);
  const roles = entries.filter(([, entry]) => !entry.removed && entry.token);
  const byTheme = entries.filter(([, entry]) => !entry.removed && entry.cssVariables);
  const fixed = entries.filter(([, entry]) => !entry.removed && entry.primitive);
  const themes = [...new Set(byTheme.flatMap(([, entry]) => Object.keys(entry.cssVariables)))];
  const theme = (name) =>
    name
      .replace(/^\w/, (letter) => letter.toUpperCase())
      .replace('-high-contrast', ', high contrast');
  const blocks = [];
  if (removed.length > 0)
    blocks.push(
      'Removed, with what to use instead:',
      table(
        ['0.7 custom property', 'Use instead', 'Note'],
        removed.map(([name, entry]) => [code(name), code(entry.cssVariable), text(entry.note)]),
      ),
    );
  if (roles.length > 0)
    blocks.push(
      'Aliases of one role, which replaces them:',
      table(
        ['0.7 custom property', 'Role', 'Used for'],
        roles.map(([name, entry]) => [code(name), code(entry.cssVariable), text(entry.component)]),
      ),
    );
  if (byTheme.length > 0)
    blocks.push(
      'Component tokens that take another role in some themes, so no one role replaces them; use the role of each theme:',
      table(
        ['0.7 custom property', 'Used for', ...themes.map(theme)],
        byTheme.map(([name, entry]) => [
          code(name),
          text(entry.component),
          ...themes.map((each) => code(entry.cssVariables[each])),
        ]),
      ),
    );
  if (fixed.length > 0)
    blocks.push(
      'Fixed colors, one palette color in every theme, which no role replaces:',
      table(
        ['0.7 custom property', 'Used for', 'Palette color'],
        fixed.map(([name, entry]) => [code(name), text(entry.component), code(entry.primitive)]),
      ),
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
  const map = await readFile(codemodsMapFile, 'utf8');
  const guide = await readFile(migrationGuideFile, 'utf8');
  return [
    { path: codemodsMapFile, contents: withMapSection(map, migrationMapSection(migration)) },
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
