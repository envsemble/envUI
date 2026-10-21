import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { distinctProblems, layoutWidths, renderedChecks } from '../lib/browser.mjs';
import { componentTokens, handRolledLayout, scoreParts, scoreRun, scoring } from '../lib/score.mjs';
import { makeApp, task } from './helpers.mjs';

const styles = `@layer env.reset, env.tokens, env.base, env.components;
@layer env.tokens {
  :root, .env-theme { --env-space-3: 0.75rem; --env-color-fg-default: #111; }
}
@layer env.base {
  .env-theme { --env-line-height-body: 1.5; }
}
@layer env.components {
  .env-card { --env-card-padding: var(--env-space-3); padding: var(--env-card-padding); }
  @container (min-width: 38rem) { .env-card { --env-card-gap: 1rem; } }
  .env-badge { --env-space-3: 1rem; }
}
`;

describe('private component tokens', () => {
  it('are the custom properties only components declare', () => {
    assert.deepEqual([...componentTokens(styles)].sort(), ['--env-card-gap', '--env-card-padding']);
  });

  let app;
  before(async () => {
    app = await makeApp({ 'node_modules/@envsemble/envui/dist/styles.css': styles });
  });
  after(() => app.cleanup());

  it('cost a raw style value each when the app sets one; system tokens and part classes are free', () => {
    app.write({
      'src/app.css': `.env-card { --env-card-padding: 0; }
.env-card-title { color: var(--env-color-fg-default); }
.settings { --env-space-3: 1rem; }
`,
      'src/Feature.tsx': `import { Button } from '@envsemble/envui';

export const Feature = () => (
  <div className="env-card" style={{ '--env-card-gap': '0' } as React.CSSProperties}>
    <Button>Go</Button>
  </div>
);
`,
    });
    const score = scoreRun({
      appDir: app.appDir,
      baseCommit: app.baseCommit,
      task: task('Button'),
    });
    assert.equal(score.styles.css.privateTokens, 1);
    assert.equal(score.styles.inline.privateTokens, 1);
    assert.equal(score.styles.total, 2);
    assert.equal(score.parts.rawStyles, scoring.rawStyles.max - 2 * scoring.rawStyles.cost);
  });
});

describe('hand-rolled layout', () => {
  it('is what the ESLint rule reports', () => {
    const found = handRolledLayout(
      'src/Feature.tsx',
      `const row = { display: 'flex' } as const;
export const A = () => <div style={row} />;
export const B = () => <div style={{ display: 'grid' }} />;
export const C = () => <div style={{ display: 'block' }} />;
`,
    );
    assert.deepEqual(
      found.map((entry) => entry.line),
      [1, 3],
    );
  });

  let app;
  before(async () => {
    app = await makeApp();
  });
  after(() => app.cleanup());

  it('costs a raw style value each, beyond what the file had', () => {
    app.write({
      'src/main.tsx': `import { Stack } from '@envsemble/envui';

export const Root = () => (
  <Stack gap={1}>
    <div style={{ display: 'flex', flexDirection: 'column' }} />
    <div style={{ display: 'grid' }} />
  </Stack>
);
`,
    });
    const score = scoreRun({ appDir: app.appDir, baseCommit: app.baseCommit, task: task('Stack') });
    assert.equal(score.styles.handRolledLayout.count, 2);
    assert.equal(score.styles.total, 2);
  });
});

describe('the browser step in the score', () => {
  const layoutTask = {
    id: 'layout',
    capabilities: [
      { id: 'button', label: 'a button', envui: ['Button'] },
      {
        id: 'side',
        label: 'side by side',
        rendered: [
          { check: 'relation', a: { text: 'A' }, relation: 'left-of', b: { text: 'B' } },
          { check: 'visible', text: ['A'], at: ['22rem'] },
        ],
      },
    ],
  };

  it('flattens rendered checks with their widths and state', () => {
    const checks = renderedChecks(layoutTask);
    assert.deepEqual(
      checks.map(({ key, at, state }) => ({ key, at, state })),
      [
        { key: 'side#0', at: layoutWidths, state: 'loaded' },
        { key: 'side#1', at: ['22rem'], state: 'loaded' },
      ],
    );
  });

  it('counts a problem seen at several widths once, and the page overflowing as one', () => {
    const problem = { rule: 'content-overflow', node: 'row', path: 'page > row', message: 'm' };
    const problems = distinctProblems([
      { width: '22rem', pageOverflow: 3, problems: [problem] },
      { width: '40rem', pageOverflow: 1.5, problems: [problem] },
      { width: '60rem', pageOverflow: 0, problems: [] },
    ]);
    assert.deepEqual(
      problems.map(({ rule, widths }) => ({ rule, widths })),
      [
        { rule: 'page-overflow', widths: ['22rem', '40rem'] },
        { rule: 'content-overflow', widths: ['22rem', '40rem'] },
      ],
    );
  });

  let app;
  before(async () => {
    app = await makeApp();
    app.write({
      'src/Feature.tsx':
        "import { Button } from '@envsemble/envui';\n\nexport const F = () => <Button>Go</Button>;\n",
    });
  });
  after(() => app.cleanup());

  const detail = () =>
    scoreRun({ appDir: app.appDir, baseCommit: app.baseCommit, task: layoutTask });
  const rendered = (checks, problems = []) => ({
    rendered: true,
    error: null,
    widths: [],
    problems,
    checks,
    pageErrors: [],
  });

  it('leaves out what it could not check without the browser step, and scales to 100', () => {
    const score = detail();
    assert.equal(score.parts.layout, null);
    assert.deepEqual(score.notChecked, ['layout']);
    assert.equal(score.coverage.ratio, 1);
    assert.equal(score.score, 100);
  });

  it('covers a rendered capability when all its checks pass, and takes points per problem', () => {
    const passed = scoreParts(
      detail(),
      layoutTask,
      rendered(
        [
          { key: 'side#0', width: '80rem', pass: true },
          { key: 'side#1', width: '22rem', pass: true },
        ],
        [{ rule: 'layout-paints', path: 'row', message: 'm', widths: ['80rem'] }],
      ),
    );
    assert.equal(passed.coverage.ratio, 1);
    assert.equal(passed.parts.layout, scoring.layout.max - scoring.layout.cost);
    assert.equal(passed.score, 100 - scoring.layout.cost);

    const failed = scoreParts(
      detail(),
      layoutTask,
      rendered([
        { key: 'side#0', width: '80rem', pass: false, detail: 'A is not left-of B' },
        { key: 'side#1', width: '22rem', pass: true },
      ]),
    );
    assert.equal(failed.coverage.ratio, 0.5);
    assert.deepEqual(failed.coverage.capabilities[1].failed, ['80rem: A is not left-of B']);
    assert.equal(failed.score, 100 - scoring.coverage.max / 2);
  });

  it('gives nothing for layout and rendered capabilities when the app does not render', () => {
    const score = scoreParts(detail(), layoutTask, {
      rendered: false,
      error: 'the app rendered nothing',
      widths: [],
      problems: [],
      checks: [],
      pageErrors: [],
    });
    assert.equal(score.parts.layout, 0);
    assert.equal(score.coverage.ratio, 0.5);
    assert.equal(score.score, 100 - scoring.layout.max - scoring.coverage.max / 2);
  });
});
