// Measures what envUI costs a page to load: the stylesheet and a few bundles an application would
// make from the built library, minified, with gzip (level 9) and brotli. The baselines of work-0028
// were measured this way, so its numbers compare with them.
//
//   node scripts/measure/MeasureSize.ts [--no-build]
//
// It builds the library first (npm run build:library); --no-build measures packages/ui/dist as it
// is. Each bundle is made with esbuild as an application would: React external, CSS imports
// external, and for "own code only" Base UI external too, split where the code imports a module
// lazily. A bundle's sizes are what the page loads first, the entry and the chunks it imports;
// `lazy` is what loads later, when the code asks for it. A bundle's `css` is the style sheets its
// modules import, as a bundler that drops the modules it shakes out puts them in the page (Vite,
// webpack), the modules the page loads first; esbuild itself would keep those of every module the
// entry reaches. It prints JSON.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build, transform } from 'esbuild';
import { repositoryRoot } from '../RepositoryPaths.ts';

/** The components of a typical application, as the baselines counted them. */
const typicalApp = [
  'EnvUIProvider',
  'Theme',
  'Button',
  'TextField',
  'Select',
  'Checkbox',
  'Switch',
  'Dialog',
  'Menu',
  'Tooltip',
  'Card',
  'Table',
  'Tabs',
  'ToastProvider',
  'Badge',
  'Alert',
  'Avatar',
  'Field',
  'Scaffold',
  'TopBar',
  'List',
  'Popover',
  'Spinner',
];

/** The bundles a page may load, as the source that imports them. */
const sets: Record<string, { source: string; ownCode?: boolean }> = {
  'Small app (Theme, Button, TextField, Card)': {
    source: "export { Theme, Button, TextField, Card } from '@envsemble/envui';",
  },
  'Theme + Button + Icon': { source: "export { Theme, Button, Icon } from '@envsemble/envui';" },
  'Typical app (23 components, with Base UI)': {
    source: `export { ${typicalApp.join(', ')} } from '@envsemble/envui';`,
  },
  'Typical app, envUI’s own code': {
    source: `export { ${typicalApp.join(', ')} } from '@envsemble/envui';`,
    ownCode: true,
  },
  'Everything, envUI’s own code': { source: "export * from '@envsemble/envui';", ownCode: true },
};

/** A style sheet import of a built module, as `import "#styles/Button.css";`. */
const stylesheetImport = /^import "#styles\/(\w+\.css)";$/gm;

/** Single components, each with what it depends on. */
const components = ['Tooltip', 'Popover', 'Menu', 'Select', 'TextField', 'Alert'];

const sizes = (bytes: Uint8Array | string) => ({
  minified: Buffer.byteLength(bytes),
  gzip: gzipSync(bytes, { level: 9 }).length,
  brotli: brotliCompressSync(bytes).length,
});

async function bundle(source: string, ownCode = false) {
  const result = await build({
    stdin: { contents: source, resolveDir: repositoryRoot, sourcefile: 'consumer.js' },
    bundle: true,
    write: false,
    splitting: true,
    outdir: resolve(repositoryRoot, '.cache/measure-size'),
    format: 'esm',
    platform: 'browser',
    minify: true,
    treeShaking: true,
    metafile: true,
    logLevel: 'silent',
    external: [
      'react',
      'react/*',
      'react-dom',
      'react-dom/*',
      '*.css',
      ...(ownCode ? ['@base-ui/react', '@base-ui/react/*'] : []),
    ],
  });
  const outputs = result.metafile.outputs;
  const key = (path: string) => relative(repositoryRoot, path).replaceAll('\\', '/');
  // What the page loads first: the entry and, transitively, the chunks it imports statically.
  // A lazily imported module is an entry point of its own; the page's is the consumer's source.
  const entry = Object.keys(outputs).find((path) => outputs[path].entryPoint === 'consumer.js')!;
  const initial = new Set<string>();
  const visit = (path: string) => {
    if (initial.has(path)) return;
    initial.add(path);
    for (const { path: imported, kind } of outputs[path].imports)
      if (kind === 'import-statement' && outputs[imported]) visit(imported);
  };
  visit(entry);
  const contents = (paths: string[]) =>
    Buffer.concat(
      result.outputFiles
        .filter((file) => paths.includes(key(file.path)))
        .map((file) => Buffer.from(file.contents)),
    );
  const chunks = Object.keys(outputs).filter((path) => path.endsWith('.js'));
  const lazy = chunks.filter((path) => !initial.has(path));
  // Where the first load's bytes come from: envUI, Base UI, or the rest (Floating UI and helpers).
  const parts = { envUI: 0, baseUI: 0, other: 0 };
  for (const path of initial)
    for (const [input, { bytesInOutput }] of Object.entries(outputs[path].inputs)) {
      const file = input.replaceAll('\\', '/');
      if (file.includes('@base-ui/')) parts.baseUI += bytesInOutput;
      else if (file.includes('packages/ui/')) parts.envUI += bytesInOutput;
      else parts.other += bytesInOutput;
    }
  const lazyBytes = contents(lazy);
  // The style sheets the first load's envUI modules import, in the order they come, each once.
  const stylesheets: string[] = [];
  for (const path of initial)
    for (const [input, { bytesInOutput }] of Object.entries(outputs[path].inputs)) {
      const file = input.replaceAll('\\', '/');
      if (bytesInOutput === 0 || !file.includes('packages/ui/dist/')) continue;
      for (const [, name] of readFileSync(resolve(repositoryRoot, file), 'utf8').matchAll(
        stylesheetImport,
      ))
        if (!stylesheets.includes(name)) stylesheets.push(name);
    }
  const css = (
    await transform(
      stylesheets
        .map((name) =>
          readFileSync(resolve(repositoryRoot, 'packages/ui/dist/styles', name), 'utf8'),
        )
        .join('\n'),
      { loader: 'css', minify: true, target: 'chrome120' },
    )
  ).code;
  return {
    ...sizes(contents([...initial])),
    css: { stylesheets: stylesheets.length, ...sizes(css) },
    parts,
    lazy: {
      chunks: lazy.length,
      minified: lazyBytes.length,
      gzip: lazy.length > 0 ? gzipSync(lazyBytes, { level: 9 }).length : 0,
    },
  };
}

if (!process.argv.includes('--no-build'))
  execFileSync(process.execPath, [resolve(repositoryRoot, 'scripts/build/BuildLibrary.ts')], {
    cwd: repositoryRoot,
    stdio: ['ignore', 'ignore', 'inherit'],
  });

const stylesheet = readFileSync(resolve(repositoryRoot, 'packages/ui/dist/styles.css'), 'utf8');
const minifiedStylesheet = await transform(stylesheet, {
  loader: 'css',
  minify: true,
  target: 'chrome120',
});

const report = {
  measured: new Date().toISOString(),
  revision: execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  }).trim(),
  units: 'bytes; gzip at level 9, brotli at its default quality',
  stylesheet: {
    shipped: Buffer.byteLength(stylesheet),
    ...sizes(minifiedStylesheet.code),
  },
  bundles: {} as Record<string, Awaited<ReturnType<typeof bundle>>>,
  components: {} as Record<string, Awaited<ReturnType<typeof bundle>>>,
};
for (const [name, { source, ownCode }] of Object.entries(sets))
  report.bundles[name] = await bundle(source, ownCode);
for (const name of components)
  report.components[name] = await bundle(`export { ${name} } from '@envsemble/envui';`);

console.log(JSON.stringify(report, null, 2));
