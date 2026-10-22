import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { packageName, scoreRun } from '../lib/score.mjs';
import { makeApp, task } from './helpers.mjs';

const feature = (body) => `import { Button } from '@envsemble/envui';

export function Feature() {
  return ${body};
}
`;

describe('typecheck', () => {
  let app;
  let elsewhere;
  before(async () => {
    app = await makeApp();
    app.write({ 'src/Feature.tsx': feature('<Button variant="primary">Go</Button>') });
    elsewhere = mkdtempSync(join(tmpdir(), 'bench-cwd-'));
  });
  after(() => {
    app.cleanup();
    rmSync(elsewhere, { recursive: true, force: true });
  });

  it('gives the same result whatever directory the scorer runs from', () => {
    const cwd = process.cwd();
    const scores = [];
    try {
      // The unrelated directory first: TypeScript keeps a failed lookup for later programs.
      for (const directory of [elsewhere, app.appDir]) {
        process.chdir(directory);
        scores.push(
          scoreRun({ appDir: app.appDir, baseCommit: app.baseCommit, task: task('Button') }),
        );
      }
    } finally {
      process.chdir(cwd);
    }
    const [outside, inApp] = scores;
    // `types: ["vite/client"]` resolves from the app's own node_modules in both cases.
    assert.deepEqual(outside.typecheck.errors, []);
    assert.equal(outside.typecheck.passed, true);
    assert.equal(outside.score, inApp.score);
    assert.equal(outside.score, 100);
  });
});

describe('type-checker suppressions', () => {
  let app;
  before(async () => {
    app = await makeApp();
  });
  after(() => app.cleanup());

  it('costs 5 points each and still counts the errors they hide', () => {
    app.write({
      'src/Feature.tsx': `import { Button } from '@envsemble/envui';

export function Feature() {
  // @ts-expect-error the variant is not in envUI's types
  return <Button variant="fancy">Go</Button>;
}
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Button'),
    });
    assert.deepEqual(
      score.typecheck.suppressions.map(({ directive, file, line }) => ({ directive, file, line })),
      [{ directive: '@ts-expect-error', file: 'src/Feature.tsx', line: 4 }],
    );
    assert.equal(score.parts.suppressionPenalty, -5);
    assert.equal(score.typecheck.passed, false);
    assert.equal(score.parts.typecheck, 0);
    assert.deepEqual(
      score.envuiErrors.map((error) => error.kind),
      ['invalid-prop'],
    );
  });

  it('sees through @ts-nocheck', () => {
    app.write({
      'src/Feature.tsx': `// @ts-nocheck
${feature('<Button tone="loud">Go</Button>')}`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Button'),
    });
    assert.deepEqual(
      score.typecheck.suppressions.map((entry) => entry.directive),
      ['@ts-nocheck'],
    );
    assert.equal(score.parts.suppressionPenalty, -5);
    assert.equal(score.envuiErrors.length, 1);
  });

  it('does not count directives already in the base version of a file', async () => {
    const based = await makeApp({
      'src/Legacy.tsx': '// @ts-ignore\nexport const legacy: number = "1";\n',
    });
    try {
      based.write({
        'src/Legacy.tsx':
          '// @ts-ignore\nexport const legacy: number = "1";\nexport const more = 2;\n',
      });
      const score = scoreRun({ appDir: based.appDir, baseCommit: based.baseCommit, task: task() });
      assert.deepEqual(score.typecheck.suppressions, []);
      assert.equal(score.parts.suppressionPenalty, 0);
    } finally {
      based.cleanup();
    }
  });
});

describe('third-party UI packages', () => {
  let app;
  before(async () => {
    app = await makeApp();
  });
  after(() => app.cleanup());

  it('names the package of a module specifier', () => {
    assert.equal(packageName('@base-ui/react/dialog'), '@base-ui/react');
    assert.equal(packageName('react-modal/lib/x'), 'react-modal');
    assert.equal(packageName('./ui'), null);
    assert.equal(packageName('node:fs'), null);
  });

  it('penalizes a direct import of an installed one that package.json does not list', () => {
    app.write({
      'src/Feature.tsx': `import { Dialog } from '@base-ui/react';

export function Feature() {
  return (
    <Dialog.Root>
      <Dialog.Popup>Delete?</Dialog.Popup>
    </Dialog.Root>
  );
}
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Dialog'),
    });
    assert.deepEqual(score.dependencies.added, []);
    assert.deepEqual(score.dependencies.ui, ['@base-ui/react']);
    assert.deepEqual(score.dependencies.imported, [
      { name: '@base-ui/react', file: 'src/Feature.tsx' },
    ]);
    assert.equal(score.parts.uiLibraryPenalty, -10);
  });

  it('counts dynamic imports and require calls too', () => {
    app.write({
      'src/Feature.tsx': `export const load = () => import('@base-ui/react');\n`,
    });
    const score = scoreRun({ appDir: app.appDir, baseCommit: app.baseCommit, task: task() });
    assert.deepEqual(score.dependencies.ui, ['@base-ui/react']);
  });
});

describe('re-exports through a local barrel', () => {
  let app;
  before(async () => {
    app = await makeApp({
      'src/ui/index.ts': `import { Dialog as EnvDialog } from '@envsemble/envui';

export { Button } from '@envsemble/envui';
export { EnvDialog as AppDialog };
export * from './more';
`,
      'src/ui/more.ts': "export { Column } from '@envsemble/envui';\nexport const local = 1;\n",
    });
  });
  after(() => app.cleanup());

  it('counts named imports from the barrel as envUI', () => {
    app.write({
      'src/Feature.tsx': `import { AppDialog, Button, Column } from './ui';

export function Feature() {
  return (
    <Column gap={2}>
      <Button variant="primary">Delete</Button>
      <AppDialog open title="Delete?" />
    </Column>
  );
}
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Button', 'Dialog', 'Column'),
    });
    assert.deepEqual(score.envui.exportsUsed, ['Button', 'Column', 'Dialog']);
    assert.equal(score.coverage.ratio, 1);
    assert.deepEqual(score.envui.jsxUses, { Column: 1, Button: 1, Dialog: 1 });
  });

  it('counts a namespace import of the barrel', () => {
    app.write({
      'src/Feature.tsx': `import * as ui from './ui';

export const Feature = () => <ui.Button>Go</ui.Button>;
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Button'),
    });
    assert.deepEqual(score.envui.exportsUsed, ['Button']);
    assert.equal(score.coverage.ratio, 1);
  });

  it('still flags a type error on an envUI component imported through it', () => {
    app.write({
      'src/Feature.tsx': `import { Button } from './ui';

export const Feature = () => <Button size="huge">Go</Button>;
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Button'),
    });
    assert.deepEqual(
      score.envuiErrors.map((error) => error.kind),
      ['invalid-prop'],
    );
  });
});

describe('props on a namespace part', () => {
  let app;
  before(async () => {
    app = await makeApp({
      'node_modules/@envsemble/envui/table.d.ts': `export declare function Root(props: { skeleton?: boolean; children?: unknown }): unknown;
export declare function HeaderCell(props: { onSortChange?: (next: string) => void; children?: unknown }): unknown;
`,
    });
    app.write({
      'node_modules/@envsemble/envui/index.d.ts': `export declare function Button(props: { children?: unknown }): unknown;
export declare function Column(props: { gap?: number; children?: unknown }): unknown;
export * as Table from './table';
`,
    });
  });
  after(() => app.cleanup());

  it('count as Namespace.Part.prop, through a named or a namespace import', () => {
    app.write({
      'src/Feature.tsx': `import { Table } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export const Feature = () => (
  <Table.Root>
    <Table.HeaderCell onSortChange={() => {}}>Name</Table.HeaderCell>
    <ui.Table.Root skeleton />
  </Table.Root>
);
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Table.HeaderCell.onSortChange', 'Table.Root.skeleton', 'Table.Root.onSortChange'),
    });
    assert.deepEqual(
      score.coverage.capabilities.map((capability) => capability.covered),
      [true, true, false],
    );
  });
});
