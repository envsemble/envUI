import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  devEntry,
  devMarker,
  devModeFigures,
  devModeProblems,
} from '../../scripts/site/SiteDevMode.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import type { ViteManifest } from '../../scripts/site/SiteModuleFiles.ts';

function catalogueLikeBuild() {
  const manifest: ViteManifest = {
    'index.html': {
      file: 'assets/index-1.js',
      isEntry: true,
      imports: ['_react-1.js', '_Button-1.js'],
      dynamicImports: [devModeFigures, 'src/examples/button/CreateProject.tsx'],
    },
    '_react-1.js': { file: 'assets/react-1.js' },
    '_Button-1.js': { file: 'assets/Button-1.js', imports: ['_react-1.js'] },
    '_View3D-1.js': { file: 'assets/View3D-1.js', imports: ['_react-1.js'] },
    [devModeFigures]: {
      file: 'assets/DevModeFigures-1.js',
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
    'assets/DevModeFigures-1.js': 'figures',
    'assets/dev-1.js': `host.setAttribute('${devMarker}', '')`,
    'assets/CreateProject-1.js': 'example',
  };
  return { manifest, contents };
}

test("dev mode in chunks of its own, which only the dev mode page's figures load, is no problem", () => {
  const { manifest, contents } = catalogueLikeBuild();
  assert.deepEqual(devModeProblems(manifest, contents), []);
});

test('dev mode anywhere else is a problem', () => {
  let { manifest, contents } = catalogueLikeBuild();
  manifest['src/examples/button/CreateProject.tsx'].dynamicImports = [devEntry];
  assert.match(devModeProblems(manifest, contents).join('\n'), /CreateProject\.tsx loads/);

  ({ manifest, contents } = catalogueLikeBuild());
  manifest['index.html']?.imports?.push(devEntry);
  assert.match(devModeProblems(manifest, contents).join('\n'), /index\.html imports/);

  ({ manifest, contents } = catalogueLikeBuild());
  contents['assets/Button-1.js'] += devMarker;
  assert.match(devModeProblems(manifest, contents).join('\n'), /Button-1\.js holds dev mode/);

  ({ manifest, contents } = catalogueLikeBuild());
  delete manifest[devEntry];
  assert.match(devModeProblems(manifest, contents).join('\n'), /not a chunk of its own/);
});

test('every figure a guide places is one its page registers', async () => {
  const figures = join(repositoryRoot, 'apps/site/src/figures/foundations');
  const loaders = await readFile(join(figures, 'FoundationFigures.ts'), 'utf8');
  const docs = join(repositoryRoot, 'docs');
  const placed: string[] = [];
  for (const name of (await readdir(docs)).filter((file) => file.endsWith('.md'))) {
    const markdown = await readFile(join(docs, name), 'utf8');
    const names = [...markdown.matchAll(/^```tsx figure=([A-Za-z]\w*)$/gm)].map(([, n]) => n);
    if (!names.length) continue;
    const page = name.replace(/\.md$/, '');
    const module = loaders.match(
      new RegExp(String.raw`^  '?${page}'?: \(\) => import\('([^']+)'\)`, 'm'),
    );
    assert.ok(module, `FoundationFigures.ts registers no figures for docs/${name}`);
    const source = await readFile(join(figures, `${module[1]}.ts`), 'utf8');
    for (const figure of names) {
      placed.push(figure);
      assert.match(source, new RegExp(`^  ${figure}: `, 'm'), `${name} places ${figure}`);
    }
  }
  assert.ok(placed.includes('TryDevMode'), 'docs/dev-mode.md places Try dev mode');
});
