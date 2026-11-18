import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';

const { parseTime, easingFunction } = await importSource(
  'MotionTokens',
  'packages/ui/src/internal/motion/motionTokens.ts',
);
const site = await importSource('RootMotionTokens', 'apps/site/src/shared/RootMotionTokens.ts');

test('a duration reads in milliseconds, and as 0 where it is 0s, unset or not a time', () => {
  assert.equal(parseTime(' 0.24s'), 240);
  assert.equal(parseTime('160ms'), 160);
  for (const none of ['0s', '0ms', '', '0', 'auto', '-1s']) assert.equal(parseTime(none), 0);
});

test('an easing is drawn as CSS draws it, from 0 to 1 and never past either, and one it cannot read as ease', () => {
  const ease = easingFunction('cubic-bezier(0.45, 0, 0.2, 1)');
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  assert.ok(ease(0.1) < 0.1 && ease(0.9) > 0.9);
  assert.ok(Math.abs(easingFunction('ease-in-out')(0.5) - 0.5) < 1e-6);
  assert.equal(easingFunction('linear')(0.3), 0.3);
  let last = 0;
  for (let step = 1; step <= 100; step += 1) {
    const value = ease(step / 100);
    assert.ok(value >= last && value <= 1);
    last = value;
  }
  assert.equal(easingFunction('steps(4)')(0.5), easingFunction('ease')(0.5));
});

test("the site's script motion follows the tokens on the page's root, an easing set to any CSS easing, else ease, and a duration of 0 where unset", () => {
  const tokens = {};
  globalThis.document = { documentElement: {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: (name) => tokens[name] ?? '' });
  const timingFunctionsChromiumSupports =
    /^(linear|ease(-in|-out|-in-out)?|(cubic-bezier|steps)\(.*\))$/;
  globalThis.CSS = {
    supports: (_, value) => timingFunctionsChromiumSupports.test(value),
  };
  try {
    assert.equal(site.rootMotionEasing('ease-exit'), 'ease');
    for (const value of ['linear', 'ease-out', 'steps(4)', 'cubic-bezier(0.2, 0, 0, 1)']) {
      tokens['--env-motion-ease'] = ` ${value}`;
      assert.equal(site.rootMotionEasing(), value);
    }
    tokens['--env-motion-ease'] = 'linear';
    assert.ok(Math.abs(site.rootEasingFunction()(0.3) - 0.3) < 1e-4);
    tokens['--env-motion-ease'] = 'ease-out';
    assert.ok(Math.abs(site.rootEasingFunction()(0.5) - easingFunction('ease-out')(0.5)) < 1e-4);
    tokens['--env-motion-ease'] = 'fast';
    assert.equal(site.rootMotionEasing(), 'ease');
    assert.ok(Math.abs(site.rootEasingFunction()(0.5) - easingFunction('ease')(0.5)) < 1e-4);
    assert.equal(site.rootMotionDuration('fast'), 0);
    tokens['--env-motion-duration-slow'] = ' 0.32s';
    assert.equal(site.rootMotionDuration('slow'), 320);
  } finally {
    delete globalThis.document;
    delete globalThis.getComputedStyle;
    delete globalThis.CSS;
  }
});
