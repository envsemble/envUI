import { build } from 'esbuild';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { collectDependencyNotices } from './DependencyNotices.mjs';
import { generateDocumentation, packageDocumentation } from './GenerateDocumentation.mjs';
import { buildTokens } from './BuildTokens.mjs';
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const libraryDirectory = resolve(repositoryRoot, 'packages/ui');
const sourceDirectory = resolve(libraryDirectory, 'src');
const outputDirectory = resolve(libraryDirectory, 'dist');

async function findTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? findTypeScriptFiles(join(directory, entry.name))
        : /\.tsx?$/.test(entry.name)
          ? [join(directory, entry.name)]
          : [],
    ),
  );
  return files.flat();
}
await buildTokens();
generateDocumentation();
await writeFile(
  resolve(libraryDirectory, 'licenses/Runtime-Dependencies-LICENSE.txt'),
  await collectDependencyNotices(repositoryRoot),
);

// A release build replaces only the package's own generated output.
if (relative(libraryDirectory, outputDirectory) !== 'dist')
  throw new Error('Library output must remain within packages/ui/dist.');
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
const sourceEntryPoints = await findTypeScriptFiles(sourceDirectory);
await build({
  entryPoints: sourceEntryPoints,
  outbase: sourceDirectory,
  outdir: outputDirectory,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: true,
});
execFileSync(
  process.execPath,
  [
    resolve(repositoryRoot, 'node_modules/typescript/bin/tsc'),
    '-p',
    resolve(libraryDirectory, 'tsconfig.json'),
  ],
  { stdio: 'inherit' },
);
// The generated token module is internal: no export reaches it, so it does not ship.
await rm(resolve(outputDirectory, 'generated'), { recursive: true, force: true });
const stylesheetBuild = await build({
  entryPoints: [resolve(sourceDirectory, 'styles/index.css')],
  bundle: true,
  write: false,
  loader: { '.woff2': 'file' },
  assetNames: 'assets/[name]',
  outfile: resolve(outputDirectory, 'styles.css'),
});
for (const output of stylesheetBuild.outputFiles) {
  await mkdir(resolve(output.path, '..'), { recursive: true });
  await writeFile(output.path, output.contents);
}
// The package ships no logos: the brand artwork stays in the repository for the catalogue.
await cp(resolve(repositoryRoot, 'assets/readme'), resolve(outputDirectory, 'assets/readme'), {
  recursive: true,
});
const documentationOutputDirectory = resolve(libraryDirectory, 'docs');
if (relative(libraryDirectory, documentationOutputDirectory) !== 'docs')
  throw new Error('Packaged documentation must remain within packages/ui/docs.');
// The packaged pages are compiled: example files and generated props tables are filled in, and
// the examples ship beside them in docs/examples.
packageDocumentation(documentationOutputDirectory);
const readme = await readFile(resolve(repositoryRoot, 'README.md'), 'utf8');
// The repository README opens with the envUI lockup; the packaged copy leaves it out.
const packagedReadme = readme.replace(
  /^<picture>(?:(?!<\/picture>)[\s\S])*?assets\/brand\/[\s\S]*?<\/picture>\s*/m,
  '',
);
if (packagedReadme.includes('assets/brand/'))
  throw new Error('The packaged README must not show brand artwork.');
await writeFile(
  resolve(libraryDirectory, 'README.md'),
  packagedReadme
    .replaceAll('](packages/ui/CHANGELOG.md)', '](CHANGELOG.md)')
    // The maintainers' guide stays in the repository.
    .replaceAll(
      '](CONTRIBUTING.md)',
      '](https://github.com/envsemble/envUI/blob/main/CONTRIBUTING.md)',
    )
    .replaceAll('src="assets/readme/', 'src="dist/assets/readme/')
    .replaceAll('srcset="assets/readme/', 'srcset="dist/assets/readme/')
    .replaceAll('packages/ui/THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md')
    .replaceAll('packages/ui/licenses/', 'licenses/'),
);
console.log(
  `Built @envsemble/envui: ${sourceEntryPoints.length} ESM modules, types, CSS, assets, and Markdown documentation with its examples.`,
);
