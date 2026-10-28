// Measures what envUI costs a page to load: the stylesheet and a few bundles an application would
// make from the built library, minified, with gzip (level 9) and brotli. The baselines of work-0028
// were measured this way, so its numbers compare with them.
//
//   node scripts/test/MeasureSize.ts [--no-build]
//
// It builds the library first (npm run build:library); --no-build measures packages/ui/dist as it
// is. Each bundle is made with esbuild as an application would: React external, CSS imports
// external, and for "own code only" Base UI external too. It prints JSON.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build, transform } from 'esbuild';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));

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
  'Toast',
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

/** Single components, each with what it depends on. */
const components = ['Tooltip', 'Popover', 'Menu', 'Select', 'TextField', 'Alert'];

const sizes = (bytes: Uint8Array | string) => ({
  minified: Buffer.byteLength(bytes),
  gzip: gzipSync(bytes, { level: 9 }).length,
  brotli: brotliCompressSync(bytes).length,
});

async function bundle(source: string, ownCode = false) {
  const result = await build({
    stdin: { contents: source, resolveDir: root, sourcefile: 'consumer.js' },
    bundle: true,
    write: false,
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
  const output = result.outputFiles[0]!;
  // Where the bytes come from: envUI, Base UI, or the rest (Floating UI and small helpers).
  const parts = { envUI: 0, baseUI: 0, other: 0 };
  for (const [path, input] of Object.entries(Object.values(result.metafile.outputs)[0]!.inputs)) {
    const file = path.replaceAll('\\', '/');
    if (file.includes('@base-ui/')) parts.baseUI += input.bytesInOutput;
    else if (file.includes('packages/ui/')) parts.envUI += input.bytesInOutput;
    else parts.other += input.bytesInOutput;
  }
  return { ...sizes(output.contents), parts };
}

if (!process.argv.includes('--no-build'))
  execFileSync(process.execPath, [resolve(root, 'scripts/build/BuildLibrary.ts')], {
    cwd: root,
    stdio: ['ignore', 'ignore', 'inherit'],
  });

const stylesheet = readFileSync(resolve(root, 'packages/ui/dist/styles.css'), 'utf8');
const minifiedStylesheet = await transform(stylesheet, {
  loader: 'css',
  minify: true,
  target: 'chrome120',
});

const report = {
  measured: new Date().toISOString(),
  revision: execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: root,
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
