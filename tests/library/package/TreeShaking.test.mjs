import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

// The namespaces' parts are pure, so a bundler that sees which parts an application renders keeps
// only those: Rolldown does through the entry point, and esbuild does when it bundles the
// namespace's own module (through the entry point it keeps the whole namespace; docs/setup.md
// gives the sizes). This test bundles each namespace module with esbuild, part by part.

const dist = join(repositoryRoot, 'packages/ui/dist');

/** The bytes esbuild keeps of a dist module, by its path from dist, for an application using `use`. */
async function bundledSize(module, use) {
  const result = await build({
    stdin: {
      contents: `import * as parts from ${JSON.stringify(module)};\nexport default ${use};\n`,
      resolveDir: dist,
      loader: 'js',
    },
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    logLevel: 'silent',
    // envUI's own code only: React, Base UI and the other dependencies are the application's.
    plugins: [
      {
        name: 'external',
        setup: (builder) =>
          builder.onResolve({ filter: /^[^./]/ }, (args) => ({ path: args.path, external: true })),
      },
    ],
  });
  return result.outputFiles[0].contents.length;
}

test('a bundler keeps only the namespace parts an application uses', async () => {
  assert.ok(existsSync(join(dist, 'index.js')), 'Build the library first: npm run build:library.');
  const index = await readFile(join(dist, 'index.js'), 'utf8');
  const namespaces = [...index.matchAll(/import \* as (\w+) from "(\.\/[^"]+)";/g)];
  assert.ok(namespaces.length >= 8, 'the entry point has the namespaces');
  for (const [, namespace, path] of namespaces) {
    const exports = await import(new URL(path, `${pathToFileURL(dist)}/`));
    const parts = Object.keys(exports).filter((name) => /^[A-Z]/.test(name));
    const whole = await bundledSize(path, `[${parts.map((part) => `parts.${part}`).join(', ')}]`);
    const sizes = await Promise.all(parts.map((part) => bundledSize(path, `parts.${part}`)));
    const smallest = Math.min(...sizes);
    assert.ok(
      parts.length === 1 || smallest < whole * 0.75,
      `${namespace}: one part keeps ${smallest} of the namespace's ${whole} bytes`,
    );
  }
});
