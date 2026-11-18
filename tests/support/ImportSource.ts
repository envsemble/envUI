import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

export async function importSource<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Exports = Record<string, any>,
>(name: string, sources: string | readonly string[]): Promise<Exports> {
  const output = join(repositoryRoot, '.cache/unit', `${name}.mjs`);
  await build({
    absWorkingDir: repositoryRoot,
    stdin: {
      contents: typeof sources === 'string' ? `export * from './${sources}';` : sources.join('\n'),
      resolveDir: repositoryRoot,
      loader: 'ts',
    },
    bundle: true,
    loader: { '.css': 'empty', '.svg': 'empty', '.woff2': 'empty' },
    platform: 'node',
    format: 'esm',
    packages: 'external',
    alias: { '@envui-internal': './packages/ui/src' },
    jsx: 'automatic',
    outfile: output,
    logLevel: 'error',
  });
  return import(pathToFileURL(output).href);
}
