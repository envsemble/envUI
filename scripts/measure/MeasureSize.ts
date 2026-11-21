import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build, transform } from 'esbuild';
import { repositoryPath, repositoryRoot } from '../RepositoryPaths.ts';

const typicalAppComponents = [
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
  'SegmentedControl',
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

const pageBundleSources: Record<string, { source: string; ownCode?: boolean }> = {
  'Small app (Theme, Button, TextField, Card)': {
    source: "export { Theme, Button, TextField, Card } from '@envsemble/envui';",
  },
  'Theme + Button + Icon': { source: "export { Theme, Button, Icon } from '@envsemble/envui';" },
  'Typical app (23 components, with Base UI)': {
    source: `export { ${typicalAppComponents.join(', ')} } from '@envsemble/envui';`,
  },
  'Typical app, envUI’s own code': {
    source: `export { ${typicalAppComponents.join(', ')} } from '@envsemble/envui';`,
    ownCode: true,
  },
  'Everything, envUI’s own code': { source: "export * from '@envsemble/envui';", ownCode: true },
};

const stylesheetImport = /^import "#styles\/(\w+\.css)";$/gm;

const singleComponents = ['Tooltip', 'Popover', 'Menu', 'Select', 'TextField', 'Alert'];

const consumerSourceFile = 'consumer.js';

const sizes = (bytes: Uint8Array | string) => ({
  minified: Buffer.byteLength(bytes),
  gzip: gzipSync(bytes, { level: 9 }).length,
  brotli: brotliCompressSync(bytes).length,
});

async function bundle(source: string, ownCode = false) {
  const result = await build({
    stdin: { contents: source, resolveDir: repositoryRoot, sourcefile: consumerSourceFile },
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
  const key = repositoryPath;
  const pageEntry = Object.keys(outputs).find(
    (path) => outputs[path].entryPoint === consumerSourceFile,
  )!;
  const initial = new Set<string>();
  const addWithStaticImports = (path: string) => {
    if (initial.has(path)) return;
    initial.add(path);
    for (const { path: imported, kind } of outputs[path].imports)
      if (kind === 'import-statement' && outputs[imported]) addWithStaticImports(imported);
  };
  addWithStaticImports(pageEntry);
  const contents = (paths: string[]) =>
    Buffer.concat(
      result.outputFiles
        .filter((file) => paths.includes(key(file.path)))
        .map((file) => Buffer.from(file.contents)),
    );
  const chunks = Object.keys(outputs).filter((path) => path.endsWith('.js'));
  const lazy = chunks.filter((path) => !initial.has(path));
  const initialBytesBySource = { envUI: 0, baseUI: 0, other: 0 };
  for (const path of initial)
    for (const [input, { bytesInOutput }] of Object.entries(outputs[path].inputs)) {
      const file = input.replaceAll('\\', '/');
      if (file.includes('@base-ui/')) initialBytesBySource.baseUI += bytesInOutput;
      else if (file.includes('packages/ui/')) initialBytesBySource.envUI += bytesInOutput;
      else initialBytesBySource.other += bytesInOutput;
    }
  const lazyBytes = contents(lazy);
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
    parts: initialBytesBySource,
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
for (const [name, { source, ownCode }] of Object.entries(pageBundleSources))
  report.bundles[name] = await bundle(source, ownCode);
for (const name of singleComponents)
  report.components[name] = await bundle(`export { ${name} } from '@envsemble/envui';`);

console.log(JSON.stringify(report, null, 2));
