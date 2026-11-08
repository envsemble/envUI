// Builds envUI's design tokens: packages/ui/tokens (DTCG 2025.10 and its resolver) through
// Terrazzo into packages/ui/src/generated/Tokens.css and the token list,
// packages/ui/src/generated/tokens.json, formatted with Prettier. Terrazzo lints the tokens first;
// the config and its plugins are in scripts/build/tokens/.
//
//   node scripts/build/BuildTokens.ts [--check]
//
// --check writes nothing and fails when a committed output differs from a fresh build, like
// `npm run icons:check`. The catalogue's and the test fixture's Vite servers rebuild on every token
// change through tokensVitePlugin(), so token edits hot-reload like any other library source.
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isAbsolute, relative, resolve } from 'node:path';
import { build, defineConfig, Logger, parse } from '@terrazzo/parser';
import type { ViteDevServer } from 'vite';
import { formatted, readIfExists, writeIfChanged } from './GeneratedFiles.ts';
import { createConfig } from './tokens/Config.ts';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const libraryDirectory = resolve(repositoryRoot, 'packages/ui');
const tokensDirectory = resolve(libraryDirectory, 'tokens');

/**
 * Builds the tokens. With `check`, compares instead of writing and throws when anything is stale.
 * `tokensDirectory` and `outDir` (file URLs ending in a slash) build other tokens elsewhere, as
 * the tests do.
 */
export async function buildTokens({
  check = false,
  logger = new Logger({ level: 'warn' }),
  tokensDirectory,
  outDir,
}: {
  check?: boolean;
  logger?: Logger;
  tokensDirectory?: URL;
  outDir?: URL;
} = {}) {
  // A fresh config per build, so a running dev server reads the token files anew.
  const rawConfig = createConfig({ tokensDirectory, outDir });
  const config = defineConfig(rawConfig, { cwd: pathToFileURL(`${libraryDirectory}/`), logger });
  const sources = await Promise.all(
    config.tokens.map(async (filename) => ({ filename, src: await readFile(filename, 'utf8') })),
  );
  const parsed = await parse(sources, { config, logger });
  const result = await build(parsed.tokens, { ...parsed, config, logger });
  const outputs = result.outputFiles.map(({ filename, contents }) => ({
    path: fileURLToPath(new URL(filename, config.outDir)),
    contents,
  }));
  const stale: string[] = [];
  for (const { path, contents } of outputs) {
    const text = await formatted(path, String(contents));
    if (check ? readIfExists(path) === text : !writeIfChanged(path, text)) continue;
    stale.push(relative(repositoryRoot, path).replaceAll('\\', '/'));
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
  let queue: Promise<unknown> = Promise.resolve();
  return {
    name: 'envui-tokens',
    async buildStart() {
      await buildTokens();
    },
    configureServer(server: ViteDevServer) {
      server.watcher.add(tokensDirectory);
      server.watcher.on('all', (event: string, path: string) => {
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

if (import.meta.main) {
  const check = process.argv.includes('--check');
  if (process.argv.slice(2).some((argument) => argument !== '--check'))
    throw new Error('Usage: BuildTokens.ts [--check]');
  const { tokenCount, files, stale } = await buildTokens({ check });
  console.log(
    check
      ? `Verified ${files} generated token files from ${tokenCount} tokens.`
      : `Built ${tokenCount} tokens into ${files} files${stale.length ? ` (updated ${stale.join(', ')})` : ' (unchanged)'}.`,
  );
}
