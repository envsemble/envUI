import { build } from 'esbuild';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectDependencyNotices } from './DependencyNotices.ts';
import { generateDocumentation } from '../docs/GenerateDocumentation.ts';
import { packageDocumentation } from '../docs/Compiler.ts';
import { buildTokens } from './BuildTokens.ts';
import { libraryDirectory, librarySourceDirectory, repositoryRoot } from '../RepositoryPaths.ts';
const outputDirectory = resolve(libraryDirectory, 'dist');

async function findFiles(directory: string, pattern: RegExp): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? findFiles(join(directory, entry.name), pattern)
        : pattern.test(entry.name)
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

if (relative(libraryDirectory, outputDirectory) !== 'dist')
  throw new Error('Library output must remain within packages/ui/dist.');
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
const moduleSourceWithoutAmbientDeclarations = /(?<!\.d)\.tsx?$/;
const sourceEntryPoints = await findFiles(
  librarySourceDirectory,
  moduleSourceWithoutAmbientDeclarations,
);
await build({
  entryPoints: sourceEntryPoints,
  outbase: librarySourceDirectory,
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
await cp(
  resolve(librarySourceDirectory, 'generated/tokens.json'),
  resolve(outputDirectory, 'tokens.json'),
);
const relativeStylesheetImport = /^import "(?:\.\.?\/)+styles\/(\w+\.css)";$/gm;
const importedStylesheets = new Set<string>();
for (const file of await findFiles(outputDirectory, /\.js$/)) {
  const code = await readFile(file, 'utf8');
  const rewritten = code.replace(relativeStylesheetImport, (_, stylesheet: string) => {
    importedStylesheets.add(stylesheet);
    return `import "#styles/${stylesheet}";`;
  });
  if (rewritten !== code) await writeFile(file, rewritten);
}
const declarationStylesheetImport = /^import '(?:\.\.?\/)+styles\/\w+\.css';\n/gm;
for (const file of await findFiles(outputDirectory, /\.d\.ts$/)) {
  const declarations = await readFile(file, 'utf8');
  const stripped = declarations.replace(declarationStylesheetImport, '');
  if (stripped !== declarations) await writeFile(file, stripped);
}
await mkdir(resolve(outputDirectory, 'styles'), { recursive: true });
await writeFile(
  resolve(outputDirectory, 'styles/empty.js'),
  "// What a style sheet import of envUI's resolves to where CSS can't load, as in Node.\nexport {};\n",
);
const layerOrder = /^@layer [\w., ]+;$/m.exec(
  await readFile(resolve(librarySourceDirectory, 'styles/Base.css'), 'utf8'),
)![0];
const stylesheetOptions = {
  bundle: true,
  minifyWhitespace: true,
  write: false,
  loader: { '.woff2': 'file', '.svg': 'file' },
} as const;
const stylesheetBuilds = await Promise.all([
  build({
    ...stylesheetOptions,
    entryPoints: [resolve(librarySourceDirectory, 'styles/index.css')],
    assetNames: 'assets/[name]',
    outfile: resolve(outputDirectory, 'styles.css'),
  }),
  build({
    ...stylesheetOptions,
    entryPoints: [...importedStylesheets].map((name) =>
      resolve(librarySourceDirectory, 'styles', name),
    ),
    assetNames: '../assets/[name]',
    outdir: resolve(outputDirectory, 'styles'),
  }),
]);
const minifiedLayerOrder = layerOrder.replaceAll(', ', ',');
for (const output of stylesheetBuilds.flatMap(({ outputFiles }) => outputFiles)) {
  await mkdir(resolve(output.path, '..'), { recursive: true });
  const moduleSheetLackingLayerOrder =
    output.path.endsWith('.css') &&
    !relative(resolve(outputDirectory, 'styles'), output.path).startsWith('..') &&
    !output.text.startsWith(minifiedLayerOrder);
  await writeFile(
    output.path,
    moduleSheetLackingLayerOrder ? `${minifiedLayerOrder}${output.text}` : output.contents,
  );
}
await cp(resolve(repositoryRoot, 'assets/readme'), resolve(outputDirectory, 'assets/readme'), {
  recursive: true,
});
const documentationOutputDirectory = resolve(libraryDirectory, 'docs');
if (relative(libraryDirectory, documentationOutputDirectory) !== 'docs')
  throw new Error('Packaged documentation must remain within packages/ui/docs.');
packageDocumentation(documentationOutputDirectory);
const readme = await readFile(resolve(repositoryRoot, 'README.md'), 'utf8');
const brandLockupPicture =
  /^<picture>(?:(?!<\/picture>)[\s\S])*?assets\/brand\/[\s\S]*?<\/picture>\s*/m;
const packagedReadme = readme.replace(brandLockupPicture, '');
if (packagedReadme.includes('assets/brand/'))
  throw new Error('The packaged README must not show brand artwork.');
await writeFile(
  resolve(libraryDirectory, 'README.md'),
  packagedReadme
    .replaceAll('](packages/ui/CHANGELOG.md)', '](CHANGELOG.md)')
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
