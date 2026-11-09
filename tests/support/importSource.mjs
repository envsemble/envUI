// Bundles TypeScript sources of the repository for Node and imports them, so a unit test can call
// the library's or the site's modules as they are written, without the library build.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

/**
 * The exports of the given sources, bundled into `.cache/unit/<name>.mjs`. `sources` is a path from
 * the repository's root, whose exports it returns, or the lines of a module that re-exports from
 * such paths, written relative to the root: `export { Badge } from './packages/ui/src/data-display/Badge.tsx';`.
 * The style sheets and assets the modules import are the browser's concern and load as nothing;
 * packages stay imports.
 */
export async function importSource(name, sources) {
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
    // The documentation's model and the library's internals, as the site imports them
    // (apps/site/tsconfig.json).
    alias: { '@docs-model': './scripts/docs/model', '@envui-internal': './packages/ui/src' },
    jsx: 'automatic',
    outfile: output,
    logLevel: 'error',
  });
  return import(pathToFileURL(output).href);
}
