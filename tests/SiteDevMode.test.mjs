// The hosted site holds dev mode in the dev mode page's files only, and every demo a guide
// page places is one the catalogue has.
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { devEntry, devMarker, devModeDemo, devModeProblems } from '../scripts/SiteDevMode.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));

/** A build as the catalogue's is: dev mode in a chunk of its own that only the demo loads. */
function build() {
  const manifest = {
    'index.html': {
      file: 'assets/index-1.js',
      isEntry: true,
      imports: ['_react-1.js', '_Button-1.js'],
      dynamicImports: [devModeDemo, 'src/examples/button/CreateProject.tsx'],
    },
    '_react-1.js': { file: 'assets/react-1.js' },
    '_Button-1.js': { file: 'assets/Button-1.js', imports: ['_react-1.js'] },
    '_View3D-1.js': { file: 'assets/View3D-1.js', imports: ['_react-1.js'] },
    [devModeDemo]: {
      file: 'assets/DevModeDemo-1.js',
      isDynamicEntry: true,
      imports: ['_Button-1.js'],
      dynamicImports: [devEntry],
    },
    [devEntry]: {
      file: 'assets/dev-1.js',
      isDynamicEntry: true,
      imports: ['_Button-1.js', '_View3D-1.js'],
    },
    'src/examples/button/CreateProject.tsx': {
      file: 'assets/CreateProject-1.js',
      isDynamicEntry: true,
      imports: ['_Button-1.js'],
    },
  };
  const contents = {
    'assets/index-1.js': 'index',
    'assets/react-1.js': 'react',
    'assets/Button-1.js': 'button',
    'assets/View3D-1.js': 'view',
    'assets/DevModeDemo-1.js': 'demo',
    'assets/dev-1.js': `host.setAttribute('${devMarker}', '')`,
    'assets/CreateProject-1.js': 'example',
  };
  return { manifest, contents };
}

test('dev mode in chunks of its own, which only the demo loads, is no problem', () => {
  const { manifest, contents } = build();
  assert.deepEqual(devModeProblems(manifest, contents), []);
});

test('dev mode anywhere else is a problem', () => {
  // Another page loads it lazily too.
  let { manifest, contents } = build();
  manifest['src/examples/button/CreateProject.tsx'].dynamicImports = [devEntry];
  assert.match(devModeProblems(manifest, contents).join('\n'), /CreateProject\.tsx loads/);

  // The page imports it with its entry.
  ({ manifest, contents } = build());
  manifest['index.html'].imports.push(devEntry);
  assert.match(devModeProblems(manifest, contents).join('\n'), /index\.html imports/);

  // Its code lands in a chunk other pages load.
  ({ manifest, contents } = build());
  contents['assets/Button-1.js'] += devMarker;
  assert.match(devModeProblems(manifest, contents).join('\n'), /Button-1\.js holds dev mode/);

  // It isn't a lazy chunk at all.
  ({ manifest, contents } = build());
  delete manifest[devEntry];
  assert.match(devModeProblems(manifest, contents).join('\n'), /not a chunk of its own/);
});

test('every demo a guide page places is one the catalogue has', async () => {
  const guide = await readFile(join(repository, 'apps/site/src/pages/GuideDocument.tsx'), 'utf8');
  const docs = join(repository, 'docs');
  const placed = [];
  for (const name of (await readdir(docs)).filter((file) => file.endsWith('.md'))) {
    const markdown = await readFile(join(docs, name), 'utf8');
    for (const [, demo] of markdown.matchAll(/^<!--\s*demo:\s*([A-Za-z]\w*)\s*-->[ \t]*$/gm)) {
      placed.push(demo);
      assert.match(guide, new RegExp(`^  ${demo}: lazyPart\\(`, 'm'), `${name} places ${demo}`);
    }
  }
  assert.ok(placed.includes('DevModeDemo'), 'docs/dev-mode.md places the dev mode demo');
});
