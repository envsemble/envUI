import { build } from 'esbuild';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { generateBrandAssets } from './GenerateBrandAssets.mjs';
import { collectDependencyNotices } from './DependencyNotices.mjs';
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
await generateBrandAssets();
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
await cp(
  resolve(repositoryRoot, 'assets/brand/envsemble/envsemble-lockup-black.svg'),
  resolve(outputDirectory, 'assets/envsemble-lockup-black.svg'),
);
await cp(resolve(repositoryRoot, 'assets/brand/envUI'), resolve(outputDirectory, 'assets/envUI'), {
  recursive: true,
});
const skillsOutputDirectory = resolve(libraryDirectory, 'skills');
if (relative(libraryDirectory, skillsOutputDirectory) !== 'skills')
  throw new Error('Packaged skills must remain within packages/ui/skills.');
await rm(skillsOutputDirectory, { recursive: true, force: true });
await cp(resolve(repositoryRoot, '.agents/skills'), skillsOutputDirectory, { recursive: true });
const readme = await readFile(resolve(repositoryRoot, 'README.md'), 'utf8');
await writeFile(
  resolve(libraryDirectory, 'README.md'),
  readme
    .replaceAll('](.agents/skills/', '](skills/')
    .replaceAll('packages/ui/THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md')
    .replaceAll('packages/ui/licenses/', 'licenses/'),
);
console.log(
  `Built @envsemble/envui: ${sourceEntryPoints.length} ESM modules, types, CSS, assets, and two agent skills.`,
);
