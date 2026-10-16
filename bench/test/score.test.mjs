import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { scoreRun } from '../lib/score.mjs';
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
