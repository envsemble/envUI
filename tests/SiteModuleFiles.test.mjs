import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { moduleFiles, moduleFilesName, writeModuleFiles } from '../scripts/SiteModuleFiles.mjs';

test('each lazily loaded catalogue module maps to the files its load fetches', () => {
  const manifest = {
    'index.html': {
      file: 'assets/index-1.js',
      isEntry: true,
      imports: ['_react-1.js', '_Button-1.js'],
      css: ['assets/index-1.css'],
    },
    '_react-1.js': { file: 'assets/react-1.js' },
    '_Button-1.js': { file: 'assets/Button-1.js', imports: ['_react-1.js'] },
    '_Add-1.js': { file: 'assets/Add-1.js', imports: ['_react-1.js'] },
    '_Grid-1.js': { file: 'assets/Grid-1.js', imports: ['_Add-1.js'], css: ['assets/Grid-1.css'] },
    'src/examples/button/CreateProject.tsx': {
      file: 'assets/CreateProject-1.js',
      src: 'src/examples/button/CreateProject.tsx',
      isDynamicEntry: true,
      imports: ['_Button-1.js', '_Add-1.js', 'index.html'],
    },
    'src/examples/button/CreateProject.tsx?raw': {
      file: 'assets/CreateProject-2.js',
      src: 'src/examples/button/CreateProject.tsx?raw',
      isDynamicEntry: true,
    },
    // A module that another lazily loaded one imports, and its imports in turn.
    'src/specimens/button/VariantMatrix.tsx': {
      file: 'assets/VariantMatrix-1.js',
      isDynamicEntry: true,
      imports: ['_Grid-1.js'],
    },
    'src/specimens/button/InteractionStates.tsx': {
      file: 'assets/InteractionStates-1.js',
      isDynamicEntry: true,
      imports: ['src/specimens/button/VariantMatrix.tsx', 'index.html'],
    },
    // A dependency's own lazy chunk, which no LoadBoundary shows.
    '../../node_modules/@shikijs/langs/dist/go.mjs': {
      file: 'assets/go-1.js',
      isDynamicEntry: true,
    },
  };
  assert.deepEqual(moduleFiles(manifest), {
    // What the page loaded with its entry is left out.
    'src/examples/button/CreateProject.tsx': ['assets/CreateProject-1.js', 'assets/Add-1.js'],
    'src/examples/button/CreateProject.tsx?raw': ['assets/CreateProject-2.js'],
    'src/specimens/button/VariantMatrix.tsx': [
      'assets/VariantMatrix-1.js',
      'assets/Grid-1.js',
      'assets/Grid-1.css',
      'assets/Add-1.js',
    ],
    'src/specimens/button/InteractionStates.tsx': [
      'assets/InteractionStates-1.js',
      'assets/VariantMatrix-1.js',
      'assets/Grid-1.js',
      'assets/Grid-1.css',
      'assets/Add-1.js',
    ],
  });
});

test('the map is written once from the manifest, and a finalised build is left as it is', async (t) => {
  const site = await mkdtemp(join(tmpdir(), 'envui-site-'));
  t.after(() => rm(site, { recursive: true, force: true }));
  // Without Vite's manifest or the map, the site was never built.
  await assert.rejects(writeModuleFiles(site), /vite build/);
  await mkdir(join(site, '.vite'));
  await writeFile(
    join(site, '.vite/manifest.json'),
    JSON.stringify({
      'src/usage/IconUsage.tsx': { file: 'assets/IconUsage-1.js', isDynamicEntry: true },
    }),
  );
  assert.equal(await writeModuleFiles(site), true);
  assert.equal(existsSync(join(site, '.vite')), false);
  const map = await readFile(join(site, moduleFilesName), 'utf8');
  assert.deepEqual(JSON.parse(map), { 'src/usage/IconUsage.tsx': ['assets/IconUsage-1.js'] });
  // Run again, as FinalizeSite.mjs on its own after npm run build:site, it keeps the map.
  assert.equal(await writeModuleFiles(site), false);
  assert.equal(await readFile(join(site, moduleFilesName), 'utf8'), map);
});
