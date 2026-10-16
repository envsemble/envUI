// Builds envUI's design tokens: packages/ui/tokens (DTCG 2025.10 and its resolver) through
// Terrazzo into packages/ui/src/styles/Tokens.css, packages/ui/src/generated/tokens.ts and
// packages/ui/src/generated/tokens.json, formatted with Prettier. Terrazzo lints the tokens first.
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

/** Builds the tokens. With `check`, compares instead of writing and throws when anything is stale. */
export async function buildTokens({ check = false, logger = new Logger({ level: 'warn' }) } = {}) {
  // A fresh config per build, so a running dev server reads the token files anew.
  const rawConfig = createConfig();
  const config = defineConfig(rawConfig, { cwd: new URL('./', configFile), logger });
  const sources = await Promise.all(
    config.tokens.map(async (filename) => ({ filename, src: await readFile(filename, 'utf8') })),
  );
  const parsed = await parse(sources, { config, logger });
  const result = await build(parsed.tokens, { ...parsed, config, logger });
  const stale = [];
  for (const { filename, contents } of result.outputFiles) {
    const path = fileURLToPath(new URL(filename, config.outDir));
    const formatted = await format(contents, {
      ...(await resolveConfig(path)),
      filepath: path,
    });
    const existing = await readFile(path, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (existing === formatted) continue;
    stale.push(relative(repositoryRoot, path).replaceAll('\\', '/'));
    // Unchanged files keep their timestamps, so watchers don't reload for nothing.
    if (!check) {
      await mkdir(resolve(path, '..'), { recursive: true });
      await writeFile(path, formatted);
    }
  }
  if (check && stale.length > 0)
    throw new Error(
      `Generated tokens are stale: ${stale.join(', ')}. Run \`npm run tokens:build\` and commit the result.`,
    );
  return { tokenCount: Object.keys(parsed.tokens).length, files: result.outputFiles.length, stale };
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
