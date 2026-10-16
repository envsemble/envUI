import assert from 'node:assert/strict';
import { test } from 'node:test';
import { moduleFiles } from '../scripts/SiteModuleFiles.mjs';

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
