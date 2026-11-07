// internal/motionTokens: the motion tokens as script reads them, so motion run from script stops
// where an application sets the durations to 0s, and the easings it draws frame by frame.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/MotionTokens.mjs');
await build({
  absWorkingDir: repository,
  entryPoints: [join(repository, 'packages/ui/src/internal/motionTokens.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: output,
  logLevel: 'error',
});
const { parseTime, easingFunction } = await import(pathToFileURL(output).href);

test('a duration reads in milliseconds, and as 0 where it is 0s, unset or not a time', () => {
  assert.equal(parseTime(' 0.24s'), 240);
  assert.equal(parseTime('160ms'), 160);
  for (const none of ['0s', '0ms', '', '0', 'auto', '-1s']) assert.equal(parseTime(none), 0);
});

test('an easing is drawn as CSS draws it, from 0 to 1 and never past either', () => {
  const ease = easingFunction('cubic-bezier(0.45, 0, 0.2, 1)');
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  // It starts slowly and settles; symmetric curves meet the middle.
  assert.ok(ease(0.1) < 0.1 && ease(0.9) > 0.9);
  assert.ok(Math.abs(easingFunction('ease-in-out')(0.5) - 0.5) < 1e-6);
  assert.equal(easingFunction('linear')(0.3), 0.3);
  let last = 0;
  for (let step = 1; step <= 100; step += 1) {
    const value = ease(step / 100);
    assert.ok(value >= last && value <= 1);
    last = value;
  }
  // An easing it can't read is the standard ease.
  assert.equal(easingFunction('steps(4)')(0.5), easingFunction('ease')(0.5));
});
