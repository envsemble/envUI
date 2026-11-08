// Bundles TypeScript sources of the repository for Node and imports them, so a unit test can call
// the library's or the site's modules as they are written, without the library build.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

export const repository = fileURLToPath(new URL('../../', import.meta.url));

/**
 * The exports of the given sources, bundled into `.cache/unit/<name>.mjs`. `sources` is a path from
 * the repository's root, whose exports it returns, or the lines of a module that re-exports from
 * such paths, written relative to the root: `export { Badge } from './packages/ui/src/content/Badge.tsx';`.
 * The style sheets and assets the modules import are the browser's concern and load as nothing;
 * packages stay imports.
 */
export async function importSource(name, sources) {
  const output = join(repository, '.cache/unit', `${name}.mjs`);
  await build({
    absWorkingDir: repository,
    stdin: {
      contents: typeof sources === 'string' ? `export * from './${sources}';` : sources.join('\n'),
      resolveDir: repository,
      loader: 'ts',
    },
    bundle: true,
    loader: { '.css': 'empty', '.svg': 'empty', '.woff2': 'empty' },
    platform: 'node',
    format: 'esm',
    packages: 'external',
    // The documentation's model, as the site imports it (apps/site/tsconfig.json).
    alias: { '@docs-model': './scripts/docs/model' },
    jsx: 'automatic',
    outfile: output,
    logLevel: 'error',
  });
  return import(pathToFileURL(output).href);
}
