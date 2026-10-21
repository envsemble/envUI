// Dev mode's readout without a page: container conditions and their thresholds, the parts index,
// and the readout's text and problems from a measurement given as data. The root entry point, and
// every other one, must not reach dev mode's code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/DevMode.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: [
      "export * from './packages/ui/src/dev/queries.ts';",
      "export * from './packages/ui/src/dev/parts.ts';",
      "export * from './packages/ui/src/dev/readout.ts';",
      "export * from './packages/ui/src/dev/units.ts';",
    ].join('\n'),
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: output,
  logLevel: 'error',
});
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
} = await import(pathToFileURL(output).href);

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

test('parts.json is read leniently, and an element is named by its known part class', () => {
  const parts = indexParts({
    components: [
      {
        name: 'Card',
        root: 'env-card',
        parts: [{ className: 'env-card-header', description: 'The title row.' }],
        states: [{ attribute: 'data-skeleton', values: ['true'] }],
      },
    ],
  });
  assert.deepEqual(parts.byClass.get('env-card'), {
    className: 'env-card',
    component: 'Card',
    description: undefined,
    root: true,
  });
  assert.equal(parts.byClass.get('env-card-header').description, 'The title row.');
  assert.deepEqual(parts.states.get('Card'), [{ attribute: 'data-skeleton', values: ['true'] }]);
  // An object of components by name, with parts from class to description.
  const byName = indexParts({
    Badge: { rootClass: 'env-badge', parts: { 'env-badge-icon': 'Its icon.' } },
  });
  assert.equal(byName.byClass.get('env-badge-icon').description, 'Its icon.');
  assert.equal(byName.byClass.get('env-badge').component, 'Badge');
  const element = (...classes) => ({ classList: classes });
  assert.equal(partClassOf(element('app', 'env-card', 'env-card-tight'), parts), 'env-card');
  assert.equal(
    partClassOf(element('env-surface', 'env-dialog-surface'), null),
    'env-dialog-surface',
  );
  assert.equal(partClassOf(element('app'), parts), null);
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
    minTextChars: 8,
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

test('no entry point but dev reaches dev mode, so production builds contain none of it', async () => {
  const entries = [
    'index.ts',
    'content.ts',
    'diff.ts',
    'rich-text.ts',
    'theme-bootstrap.ts',
    'messages.ts',
  ];
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
