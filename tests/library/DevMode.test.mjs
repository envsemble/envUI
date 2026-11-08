// Dev mode's readout without a page: container conditions and their thresholds, the parts index,
// and the readout's text and problems from a measurement given as data. The root entry point, and
// every other one, must not reach dev mode's code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { importSource, repository } from '../support/importSource.mjs';

const {
  conditionHolds,
  thresholdsOf,
  readContainerQueries,
  queriesFor,
  indexParts,
  partClassOf,
  read,
  toPx,
  windowClassOf,
} = await importSource('DevMode', [
  "export * from './packages/ui/src/dev/queries.ts';",
  "export * from './packages/ui/src/dev/parts.ts';",
  "export * from './packages/ui/src/dev/readout.ts';",
  "export * from './packages/ui/src/dev/units.ts';",
]);

test('container conditions: the widths they test and whether they hold', () => {
  assert.deepEqual(thresholdsOf('(inline-size >= 37.5rem)', 16), [37.5]);
  assert.deepEqual(thresholdsOf('(width > 600px) and (width < 75rem)', 16), [37.5, 75]);
  const holds = (condition, width) => conditionHolds(condition, width, 16);
  assert.equal(holds('(inline-size >= 37.5rem)', 40), true);
  assert.equal(holds('(inline-size >= 37.5rem)', 37), false);
  assert.equal(holds('(37.5rem <= width < 52.5rem)', 40), true);
  assert.equal(holds('(37.5rem <= width < 52.5rem)', 60), false);
  assert.equal(holds('(30rem < inline-size)', 31), true);
  assert.equal(holds('(min-width: 640px)', 40), true);
  assert.equal(holds('(max-width: 20rem) or (min-width: 60rem)', 40), false);
  assert.equal(holds('not (inline-size >= 37.5rem)', 22), true);
  // A height, or a style query, can't be told from a width.
  assert.equal(holds('(block-size > 20rem)', 40), null);
});

test('container queries are read from style sheets by container name, and credited by name', () => {
  const rule = (containerName, conditionText, styleRules) => ({
    containerName,
    conditionText: containerName ? `${containerName} ${conditionText}` : conditionText,
    cssRules: Array.from({ length: styleRules }, () => ({ selectorText: '.x' })),
  });
  const sheets = [
    {
      cssRules: [
        rule('env-scaffold', '(inline-size >= 37.5rem)', 2),
        // A layer holds more: the same condition merges, another one adds.
        {
          cssRules: [
            rule('env-scaffold', '(inline-size >= 37.5rem)', 1),
            rule('env-scaffold', '(inline-size >= 75rem)', 1),
          ],
        },
        rule('', '(inline-size >= 24rem)', 1),
      ],
    },
    {
      get cssRules() {
        throw new Error('A style sheet from another origin');
      },
    },
  ];
  const queries = readContainerQueries(sheets, 16);
  assert.deepEqual(
    queries
      .get('env-scaffold')
      .map(({ condition, rules, thresholds }) => [condition, rules, thresholds]),
    [
      ['(inline-size >= 37.5rem)', 3, [37.5]],
      ['(inline-size >= 75rem)', 1, [75]],
    ],
  );
  assert.equal(queriesFor('env-scaffold', queries).length, 2);
  // A named container isn't credited with the queries that name none; an unnamed one is.
  assert.deepEqual(
    queriesFor('', queries).map(({ condition }) => condition),
    ['(inline-size >= 24rem)'],
  );
});

test('parts.json is indexed by part class, and names never wait for it', () => {
  const parts = indexParts({
    schemaVersion: 1,
    components: {
      Card: {
        root: 'env-card',
        source: 'packages/ui/src/layout/Card.tsx',
        parts: [
          { class: 'env-card', description: "The card's surface." },
          { class: 'env-card-header', description: 'The title row.' },
        ],
        states: [{ attribute: 'data-skeleton', values: [''], parts: ['env-card'] }],
      },
    },
    shared: {
      ConnectedRows: {
        root: 'env-connected-rows',
        parts: [{ class: 'env-connected-row', description: 'One joined row.' }],
        states: [],
        usedBy: ['List'],
      },
    },
  });
  assert.deepEqual(parts.byClass.get('env-card'), {
    className: 'env-card',
    component: 'Card',
    description: "The card's surface.",
    root: true,
    shared: false,
  });
  assert.equal(parts.byClass.get('env-card-header').root, false);
  assert.equal(parts.byClass.get('env-connected-row').shared, true);
  assert.deepEqual(parts.states.get('Card'), [
    { attribute: 'data-skeleton', values: [''], parts: ['env-card'] },
  ]);
  // Another format is refused rather than read as having no descriptions.
  assert.throws(() => indexParts([{ name: 'Card' }]), /no components/);
  // A component's own class wins over a helper's on the same element; the window's container and
  // dev mode's own classes are no parts.
  const element = (...classes) => ({ className: classes.join(' '), classList: classes });
  assert.equal(partClassOf(element('app', 'env-card', 'env-surface')), 'env-card');
  assert.equal(partClassOf(element('env-surface', 'env-dialog-surface')), 'env-dialog-surface');
  assert.equal(partClassOf(element('env-theme', 'env-window')), 'env-theme');
  assert.equal(partClassOf(element('env-dev-plane')), null);
  assert.equal(partClassOf(element('app')), null);
});

test('widths: lengths in px, and window classes', () => {
  assert.equal(toPx('40rem', 16), 640);
  assert.equal(toPx(' 600px ', 16), 600);
  assert.equal(toPx(320, 16), 320);
  assert.throws(() => toPx('40vw', 16), /lengths such as "40rem"/);
  assert.deepEqual([22, 37.5, 52.4, 52.5, 80].map(windowClassOf), [
    'compact',
    'medium',
    'medium',
    'expanded',
    'large',
  ]);
});

// --- The readout, from a measurement given as data --------------------------------------------

const box = (x, y, w, h) => ({ x, y, w, h });
let nextKey = 1;
/** A node of a measurement, visible and quiet unless the test says otherwise. */
function node(kind, name, at, more = {}) {
  return {
    key: nextKey++,
    kind,
    name,
    part: null,
    overlay: false,
    children: [],
    depth: 0,
    hidden: null,
    hiddenInside: 0,
    box: at,
    clip: at,
    size: { w: at.w, h: at.h },
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'normal',
    justifyContent: 'normal',
    gap: [0, 0],
    padding: [0, 0, 0, 0],
    border: [0, 0, 0, 0],
    grid: null,
    container: null,
    overflow: { x: 'visible', y: 'visible' },
    scrollSize: { w: at.w, clientW: at.w, h: at.h, clientH: at.h },
    scroll: null,
    position: 'static',
    sticky: null,
    paints: [],
    kids: [],
    inner: [],
    side: null,
    level: 0,
    ...more,
  };
}
/** A measurement of nodes given as [node, parent index] pairs. */
function snapshot(entries, more = {}) {
  const nodes = entries.map(([data, parent], index) => ({ ...data, index, parent }));
  for (const item of nodes) if (item.parent !== null) nodes[item.parent].children.push(item.index);
  return {
    rootPx: 16,
    root: { label: 'div.env-theme', box: box(0, 0, 640, 480) },
    window: { w: 640, h: 480 },
    nodes,
    tops: nodes.filter((item) => item.parent === null).map((item) => item.index),
    queries: new Map([
      [
        'env-scaffold',
        [
          {
            container: 'env-scaffold',
            condition: '(inline-size >= 37.5rem)',
            rules: 1,
            thresholds: [37.5],
          },
        ],
      ],
    ]),
    minTextCharacters: 8,
    ...more,
  };
}

test('the readout lists each node with its layout, and folds identical siblings', () => {
  const card = (name, x) =>
    node('column', name, box(x, 64, 128, 64), { display: 'block', padding: [8, 8, 8, 8] });
  const reading = read(
    snapshot([
      [
        node('scaffold', 'app', box(0, 0, 640, 480), {
          container: { name: 'env-scaffold', type: 'inline-size' },
          display: 'grid',
          gap: [16, 16],
          grid: { columns: [192, 432], rows: [480], areas: null },
        }),
        null,
      ],
      [
        node('row', 'cards', box(0, 64, 640, 64), {
          flexWrap: 'wrap',
          gap: [12, 12],
          justifyContent: 'space-between',
        }),
        0,
      ],
      [card('first', 0), 1],
      [card('second', 140), 1],
      [card('third', 280), 1],
      [
        node('box', 'drawer', box(0, 0, 0, 0), {
          hidden: 'hidden (display: none)',
          hiddenInside: 2,
        }),
        0,
      ],
      [
        node('column', 'env-list', box(0, 128, 640, 352), {
          scroll: {
            axes: 'y',
            content: { w: 640, h: 1600 },
            client: { w: 640, h: 352 },
            at: { x: 0, y: 160 },
          },
          overflow: { x: 'hidden', y: 'auto' },
          inner: [
            {
              label: 'header.env-page-header',
              sticky: {
                edge: 'top',
                offset: 0,
                scroller: 'column "env-list"',
                scrolls: true,
                stuck: true,
              },
            },
          ],
        }),
        0,
      ],
    ]),
  );
  assert.deepEqual(reading.text.split('\n'), [
    'root div.env-theme · 40×30rem · medium · window 40×30rem · 1rem = 16px',
    'scaffold "app" · 40×30rem · medium · container env-scaffold (queried at 37.5rem) · grid · gap 1rem · columns 2 = 12 | 27rem',
    '  row "cards" · 40×4rem · medium · flex row wrap · justify space-between · gap 0.75rem',
    '    column "first" · 8×4rem · compact · block · padding 0.5rem',
    '    … and 2 more like "first" ("second", "third")',
    '  box "drawer" · hidden (display: none) (2 nodes inside)',
    '  column "env-list" · 40×22rem · medium · flex row · scrolls y (content 40×100rem, at 0,10rem) · holds header.env-page-header: sticks top at 0rem in column "env-list", stuck now',
    '',
    'problems: none',
  ]);
  assert.deepEqual(reading.problems, []);
});

test('the readout finds what paints, spills, overflows, never sticks, leaves the window or is squeezed', () => {
  const reading = read(
    snapshot([
      [
        node('page', 'page', box(0, 0, 352, 480), {
          display: 'block',
          scrollSize: { w: 480, clientW: 352, h: 480, clientH: 480 },
        }),
        null,
      ],
      // Wider content in the grid makes the page wider too; only the grid is reported.
      [
        node('grid', 'wide', box(0, 0, 352, 16), {
          display: 'grid',
          scrollSize: { w: 480, clientW: 352, h: 16, clientH: 16 },
        }),
        0,
      ],
      [
        node('row', 'actions', box(0, 32, 352, 40), {
          paints: ['background rgb(255, 0, 0)'],
          kids: [
            { label: 'button.env-button', box: box(300, 32, 96, 40), node: false, detached: false },
          ],
        }),
        0,
      ],
      [
        node('column', 'clipped', box(0, 80, 352, 96), {
          overflow: { x: 'hidden', y: 'hidden' },
          inner: [{ label: 'p.env-text', squeezed: { chars: 4, width: 32 } }],
        }),
        0,
      ],
      [
        node('row', 'heading', box(0, 80, 352, 24), {
          position: 'sticky',
          sticky: {
            edge: 'top',
            offset: 0,
            scroller: 'column "clipped"',
            scrolls: false,
            stuck: false,
          },
        }),
        3,
      ],
      // A component painting through a primitive it renders is no fault: the node is its part.
      [
        node('column', 'env-card', box(0, 200, 352, 96), {
          part: 'env-card',
          paints: ['a shadow'],
        }),
        0,
      ],
      [
        node('popover', 'env-menu-popup', box(-16, 40, 160, 120), {
          overlay: true,
          side: 'bottom',
        }),
        null,
      ],
    ]),
  );
  assert.deepEqual(
    reading.problems.map(({ rule, path }) => `${rule} ${path}`),
    [
      'layout-paints page > row "actions"',
      'child-overflow page > row "actions"',
      'text-squeezed page > column "clipped"',
      'sticky-without-scroll page > column "clipped" > row "heading"',
      'overlay-off-window popover "env-menu-popup"',
      'content-overflow page > grid "wide"',
    ],
  );
  const message = (rule) => reading.problems.find((problem) => problem.rule === rule).message;
  assert.equal(
    message('child-overflow'),
    'row "actions": its child button.env-button sticks out 2.75rem past its right. It doesn\'t scroll, so that spills over its neighbours.',
  );
  assert.match(
    message('content-overflow'),
    /^grid "wide": its content is 8rem wider than it \(22rem\)/,
  );
  assert.match(message('overlay-off-window'), /reaches outside the window \(-1,2\.5 to 9,10rem/);
  assert.match(
    reading.text,
    /\n {2}popover "env-menu-popup" · 10×7\.5rem · compact · flex row · at -1,2\.5rem in the window · side bottom\n/,
  );
  assert.equal(reading.problemsByNode[1].length, 1);
});

test('what is set out on purpose, or out of the flow, neither spills nor overflows', () => {
  const kid = (label, at, more = {}) => ({ label, box: at, node: false, detached: false, ...more });
  const none = { left: 0, right: 0, top: 0, bottom: 0 };
  const reading = read(
    snapshot([
      [node('page', 'page', box(0, 0, 352, 480), { display: 'block' }), null],
      // A text button's hit area, set out 4 px past the row by its negative margin.
      [
        node('row', 'links', box(0, 0, 352, 40), {
          kids: [kid('a.env-button', box(300, 0, 56, 40), { outset: { ...none, right: 4 } })],
        }),
        0,
      ],
      // A child out of the flow, such as a resize handle across the edge, never spills.
      [
        node('column', 'panel', box(0, 48, 352, 96), {
          kids: [kid('div.env-handle', box(0, 42, 352, 12), { detached: true })],
        }),
        0,
      ],
      // Content 3 px wider by a hit area inside, and 16 px wider than that by something else.
      [
        node('row', 'start', box(0, 160, 18, 24), {
          scrollSize: { w: 21, clientW: 18, h: 24, clientH: 24 },
          outsetInside: 3,
        }),
        0,
      ],
      [
        node('row', 'wide', box(0, 200, 160, 24), {
          scrollSize: { w: 179, clientW: 160, h: 24, clientH: 24 },
          outsetInside: 3,
        }),
        0,
      ],
      // Set out by 4 px, and sticking out 20 px.
      [
        node('row', 'spills', box(0, 240, 352, 40), {
          kids: [
            kid('button.env-button', box(300, 240, 72, 40), { outset: { ...none, right: 4 } }),
          ],
        }),
        0,
      ],
    ]),
  );
  assert.deepEqual(
    reading.problems.map(({ rule, node }) => `${rule} ${node}`),
    ['child-overflow row "spills"', 'content-overflow row "wide"'],
  );
  assert.match(reading.problems[0].message, /sticks out 1rem past its right/);
  assert.match(reading.problems[1].message, /its content is 1rem wider than it/);
});

test('no entry point but dev reaches dev mode, so production builds contain none of it', async () => {
  // Every entry point the package exports, but dev and the one-icon pattern.
  const { exports } = JSON.parse(
    await readFile(join(repository, 'packages/ui/package.json'), 'utf8'),
  );
  const entries = Object.entries(exports)
    .filter(
      ([name, target]) =>
        name !== './dev' && !name.includes('*') && /\.tsx?$/.test(target['envui-source'] ?? ''),
    )
    .map(([, target]) => target['envui-source'].replace(/^\.\/src\//, ''));
  assert.ok(entries.includes('index.ts'), String(entries));
  const dev = join(repository, 'packages/ui/src/dev');
  for (const entry of entries) {
    const result = await build({
      absWorkingDir: repository,
      entryPoints: [join(repository, 'packages/ui/src', entry)],
      bundle: true,
      write: false,
      metafile: true,
      format: 'esm',
      platform: 'neutral',
      packages: 'external',
      loader: { '.css': 'empty', '.woff2': 'empty' },
      logLevel: 'error',
    });
    const reached = Object.keys(result.metafile.inputs).filter(
      (input) =>
        !relative(dev, join(repository, input)).startsWith('..') || input.endsWith('src/dev.ts'),
    );
    assert.deepEqual(reached, [], `${entry} reaches dev mode`);
    assert.doesNotMatch(result.outputFiles[0].text, /data-env-dev|installDevMode/, entry);
  }
});

test('the dev entry imports no library beyond React and Base UI, so it loads without the others', async () => {
  // The content, rich-text and diff entries' libraries, such as code highlighting, are installed by
  // the applications that use those entries; the inspector once reached one through Code.
  const { dependencies, peerDependencies } = JSON.parse(
    await readFile(join(repository, 'packages/ui/package.json'), 'utf8'),
  );
  const declared = [...Object.keys(dependencies), ...Object.keys(peerDependencies)];
  const result = await build({
    absWorkingDir: repository,
    entryPoints: [join(repository, 'packages/ui/src/dev.ts')],
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    platform: 'neutral',
    packages: 'external',
    loader: { '.css': 'empty', '.woff2': 'empty' },
    logLevel: 'error',
  });
  const packages = new Set(
    Object.values(result.metafile.inputs).flatMap(({ imports }) =>
      imports.filter((entry) => entry.external).map((entry) => entry.path),
    ),
  );
  const reached = [...packages].filter(
    (path) => !declared.some((name) => path === name || path.startsWith(`${name}/`)),
  );
  assert.deepEqual(reached, [], 'the dev entry imports libraries envUI does not declare');
});

test('installDevMode() warns about parts in the wrong shape and installs all the same', async () => {
  // The installer alone, with a stand-in for its UI and React's root, on a stand-in document.
  const installer = join(repository, '.cache/unit/DevModeInstall.mjs');
  await build({
    absWorkingDir: repository,
    entryPoints: [join(repository, 'packages/ui/src/dev/install.tsx')],
    bundle: true,
    loader: { '.css': 'empty' },
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    packages: 'external',
    outfile: installer,
    logLevel: 'error',
    plugins: [
      {
        name: 'stand-ins',
        setup(builder) {
          builder.onResolve({ filter: /^(\.\/ui\/DevMode\.js|react-dom\/client)$/ }, (args) => ({
            path: args.path,
            namespace: 'stand-in',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'stand-in' }, (args) => ({
            contents:
              args.path === 'react-dom/client'
                ? 'export const createRoot = () => ({ render() {}, unmount() {} });'
                : 'export const DevMode = () => null;',
            loader: 'js',
          }));
        },
      },
    ],
  });
  const element = () => ({
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    remove() {},
  });
  const appended = [];
  const listeners = [];
  globalThis.document = {
    createElement: element,
    head: { append: (node) => appended.push(node) },
    body: { append: (node) => appended.push(node) },
  };
  globalThis.window = {
    addEventListener: (type) => listeners.push(type),
    removeEventListener() {},
    setTimeout: (run) => run(),
  };
  const warn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args.map(String).join(' '));
  try {
    const { installDevMode } = await import(pathToFileURL(installer).href);
    const handle = installDevMode({ parts: [{ name: 'Card' }] });
    await handle.ready;
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /the parts given are not docs\/generated\/parts\.json/);
    // It installed all the same: the readout on the window, its style sheet, host and shortcut.
    assert.equal(window.envui.layout, handle.layout);
    assert.equal(appended.length, 2);
    assert.ok(appended.some((node) => 'data-env-dev-host' in node.attributes));
    assert.deepEqual(listeners, ['keydown']);
    handle.uninstall();
    assert.equal(window.envui.layout, undefined);
  } finally {
    console.warn = warn;
    delete globalThis.document;
    delete globalThis.window;
  }
});
