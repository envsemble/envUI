import { build } from 'esbuild';
import { readdir, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = resolve(root, 'packages/ui');
async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? sourceFiles(join(directory, entry.name))
        : /\.tsx?$/.test(entry.name)
          ? [join(directory, entry.name)]
          : [],
    ),
  );
  return files.flat();
}
const outputDirectory = resolve(pkg, 'dist');
if (relative(pkg, outputDirectory) !== 'dist')
  throw new Error('Library output must remain within packages/ui/dist.');
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(resolve(pkg, 'dist'), { recursive: true });
const entries = await sourceFiles(resolve(pkg, 'src'));
await build({
  entryPoints: entries,
  outbase: resolve(pkg, 'src'),
  outdir: resolve(pkg, 'dist'),
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: true,
});
execFileSync(
  process.execPath,
  [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', resolve(pkg, 'tsconfig.json')],
  { stdio: 'inherit' },
);
const css = await build({
  entryPoints: [resolve(pkg, 'src/styles/index.css')],
  bundle: true,
  write: false,
  loader: { '.woff2': 'file' },
  assetNames: 'assets/[name]',
  outfile: resolve(pkg, 'dist/styles.css'),
});
for (const output of css.outputFiles) {
  await mkdir(resolve(output.path, '..'), { recursive: true });
  await writeFile(output.path, output.contents);
}
await cp(
  resolve(pkg, 'src/assets/brand/envsemble-lockup-black.svg'),
  resolve(pkg, 'dist/assets/envsemble-lockup-black.svg'),
);
const guideBundle = await build({
  entryPoints: [resolve(root, 'apps/docs/src/Reference.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const guide = await import(
  `data:text/javascript;base64,${Buffer.from(guideBundle.outputFiles[0].contents).toString('base64')}`
);
await writeFile(resolve(pkg, 'USAGE.md'), guide.renderUsageMarkdown());
console.log(
  `Built @envsemble/ui: ${entries.length} ESM modules, types, CSS, assets, and usage guide.`,
);
