import { build, transform } from 'esbuild';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { collectDependencyNotices } from './DependencyNotices.ts';
import { generateDocumentation, packageDocumentation } from '../docs/GenerateDocumentation.ts';
import { buildTokens } from './BuildTokens.ts';
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const libraryDirectory = resolve(repositoryRoot, 'packages/ui');
const sourceDirectory = resolve(libraryDirectory, 'src');
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

// A release build replaces only the package's own generated output.
if (relative(libraryDirectory, outputDirectory) !== 'dist')
  throw new Error('Library output must remain within packages/ui/dist.');
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
// Every module, without the ambient declarations, which hold no code.
const sourceEntryPoints = await findFiles(sourceDirectory, /(?<!\.d)\.tsx?$/);
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
// The token list ships as `@envsemble/envui/tokens.json`.
await cp(
  resolve(sourceDirectory, 'generated/tokens.json'),
  resolve(outputDirectory, 'tokens.json'),
);
// Each module imports the style sheets it draws with, as ../styles/Button.css in the source. In the
// package they become #styles/Button.css, the package's own import (package.json "imports"): a
// bundler, which sets the `module` condition, loads dist/styles/Button.css, and Node, which can't
// load CSS, an empty module. So the modules a tree-shaken application keeps bring exactly their
// style sheets, and the same modules still run in Node for server rendering and tests.
const stylesheetImport = /^import "(?:\.\.?\/)+styles\/(\w+\.css)";$/gm;
const importedStylesheets = new Set<string>();
for (const file of await findFiles(outputDirectory, /\.js$/)) {
  const code = await readFile(file, 'utf8');
  const rewritten = code.replace(stylesheetImport, (_, stylesheet: string) => {
    importedStylesheets.add(stylesheet);
    return `import "#styles/${stylesheet}";`;
  });
  if (rewritten !== code) await writeFile(file, rewritten);
}
// A style sheet a module imports as text, as dev mode imports its own, becomes that text in the
// module, without comments and whitespace as the other style sheets ship.
const stylesheetTextImport = /^import (\w+) from "(\.[^"]+\.css)\?raw"(?: with \{[^}]*\})?;$/gm;
for (const file of await findFiles(outputDirectory, /\.js$/)) {
  const code = await readFile(file, 'utf8');
  const imports = [...code.matchAll(stylesheetTextImport)];
  if (!imports.length) continue;
  let inlined = code;
  for (const [statement, name, specifier] of imports) {
    const source = resolve(sourceDirectory, relative(outputDirectory, dirname(file)), specifier);
    const { code: css } = await transform(await readFile(source, 'utf8'), {
      loader: 'css',
      minifyWhitespace: true,
    });
    inlined = inlined.replace(statement, `const ${name} = ${JSON.stringify(css)};`);
  }
  await writeFile(file, inlined);
}
// The declarations carry no style sheet imports: they hold no types, and a checker that resolves
// side-effect imports would look for declarations of CSS.
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
// The style sheets ship without comments and whitespace, which only the sources need. Their rules
// and values stay as written, in the same order and layers: custom properties keep their exact
// text. styles.css holds them all, for applications without a bundler; dist/styles/ holds each one
// a module imports, Base.css with the parts it imports. Each of those starts with the layer order,
// so the layers keep their order whichever of envUI's style sheets a page loads first.
const layerOrder = /^@layer [\w., ]+;$/m.exec(
  await readFile(resolve(sourceDirectory, 'styles/Base.css'), 'utf8'),
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
    entryPoints: [resolve(sourceDirectory, 'styles/index.css')],
    assetNames: 'assets/[name]',
    outfile: resolve(outputDirectory, 'styles.css'),
  }),
  build({
    ...stylesheetOptions,
    entryPoints: [...importedStylesheets].map((name) => resolve(sourceDirectory, 'styles', name)),
    assetNames: '../assets/[name]',
    outdir: resolve(outputDirectory, 'styles'),
  }),
]);
const minifiedLayerOrder = layerOrder.replaceAll(', ', ',');
for (const output of stylesheetBuilds.flatMap(({ outputFiles }) => outputFiles)) {
  await mkdir(resolve(output.path, '..'), { recursive: true });
  const ownSheet =
    output.path.endsWith('.css') &&
    !relative(resolve(outputDirectory, 'styles'), output.path).startsWith('..') &&
    !output.text.startsWith(minifiedLayerOrder);
  await writeFile(output.path, ownSheet ? `${minifiedLayerOrder}${output.text}` : output.contents);
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
