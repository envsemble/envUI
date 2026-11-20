import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planCheck } from '../../scripts/test/CheckPlan.ts';

const names = (plan: ReturnType<typeof planCheck>) => plan.staticTasks.map((task) => task.name);

test('a changed component test runs in Chromium in the check tier, and opens no build', () => {
  const plan = planCheck(['tests/component/Tree.test.tsx']);
  assert.deepEqual(plan.componentTests, ['Tree']);
  assert.deepEqual(plan.playwrightSpecs, []);
  assert.deepEqual(plan.deferred, []);
  assert.deepEqual(plan.builds, { library: false, site: false });
});

test('a site spec goes to Playwright and opens the site build', () => {
  const plan = planCheck(['tests/browser/site/SiteFailures.spec.ts']);
  assert.deepEqual(plan.playwrightSpecs, ['SiteFailures']);
  assert.deepEqual(plan.componentTests, []);
  assert.equal(plan.builds.site, true);
});

test('a spec on the library build waits for check:affected, which builds the library for it', () => {
  const check = planCheck(['tests/browser/library/Hydration.spec.ts']);
  assert.deepEqual(check.deferred, ['Hydration']);
  assert.deepEqual(check.browserSpecs, []);
  assert.equal(check.builds.library, false);
  const affected = planCheck(['tests/browser/library/Hydration.spec.ts'], { affected: true });
  assert.deepEqual(affected.deferred, []);
  assert.deepEqual(affected.playwrightSpecs, ['Hydration']);
  assert.equal(affected.builds.library, true);
});

test('live development runs apart from the other browser specs', () => {
  const plan = planCheck(['tests/browser/site/LiveDevelopment.spec.ts'], { affected: true });
  assert.deepEqual(plan.live, ['LiveDevelopment']);
  assert.ok(!plan.browserSpecs.includes('LiveDevelopment'));
});

test('a unit test on the library build opens the build in check:affected', () => {
  const path = 'tests/library/package/PackageContents.test.ts';
  assert.equal(planCheck([path]).builds.library, false);
  assert.equal(planCheck([path], { affected: true }).builds.library, true);
});

test('static checks follow the changed files, and the fast unit tests always run', () => {
  const plan = planCheck(['scripts/test/TestScope.ts']);
  assert.ok(names(plan).includes('lint'));
  assert.ok(names(plan).includes('typecheck scripts'));
  assert.ok(!names(plan).some((name) => name.startsWith('docs:check')));
  assert.equal(names(plan).at(-1), 'unit tests');
  const unit = plan.staticTasks.at(-1)!;
  assert.ok(unit.run.includes('tests/tooling/TestScope.test.ts'));
  assert.ok(!unit.run.some((path) => path.startsWith('tests/library/package/')));
});

test('the documentation checks compare against the base they are given', () => {
  const docs = planCheck(['docs/setup.md'], { base: 'origin/main' }).staticTasks.find(
    (task) => task.name === 'docs:check parts',
  );
  assert.deepEqual(docs?.run.slice(-2), ['--base', 'origin/main']);
});

test('a list of paths too long for a Windows command line lints and formats everything', () => {
  const plan = planCheck(Array(1000).fill('scripts/test/TestScope.ts'));
  assert.deepEqual(plan.scope.whole, { lint: true, css: false, format: true });
  const lint = plan.staticTasks.find((task) => task.name === 'lint');
  assert.equal(lint?.run.at(-1), '.');
});
