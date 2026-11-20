import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isAbsolute, relative, resolve } from 'node:path';
import { build, defineConfig, Logger, parse } from '@terrazzo/parser';
import type { Plugin, ViteDevServer } from 'vite';
import { formatted, GeneratedOutput } from './GeneratedFiles.ts';
import { createConfig } from './tokens/Config.ts';
import { libraryDirectory } from '../RepositoryPaths.ts';

const tokensDirectory = resolve(libraryDirectory, 'tokens');

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
  const output = new GeneratedOutput({ check, regenerate: 'npm run tokens:build' });
  for (const { path, contents } of outputs)
    output.writeOrCheck(path, await formatted(path, String(contents)));
  output.throwIfStale();
  return {
    tokenCount: Object.keys(parsed.tokens).length,
    files: outputs.length,
    stale: output.changed,
  };
}

export function tokensVitePlugin(): Plugin {
  let buildsOneAtATime: Promise<unknown> = Promise.resolve();
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
        buildsOneAtATime = buildsOneAtATime
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
