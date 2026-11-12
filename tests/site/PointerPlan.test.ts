// The virtual pointer's plan of a script's time (apps/site/src/motion/pointer/PointerPlan.ts): a
// wait lasts the ms it says, the first is cut short, moves and typing play a little brisker than
// written, a click holds its button a moment, and the pointer steps aside after a press. The tiles
// and figures are timed against these.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.ts';

const { planOf, aimsOf, headingAt, presentAt, firstWait } = await importSource<
  typeof import('../../apps/site/src/motion/pointer/PointerPlan.ts')
>('PointerPlan', 'apps/site/src/motion/pointer/PointerPlan.ts');

test('a script plans its moves and presses at the times its waits say', () => {
  const plan = planOf([
    { wait: 1000 },
    { to: '.button', duration: 500 },
    { wait: 200 },
    { click: true },
    { wait: 600 },
    { leave: true },
    { wait: 300 },
  ]);
  // The first wait is cut so the animation starts at once; a move takes 0.8 of what it says.
  const aim = { selector: '.button', text: undefined, x: 0.5, y: 0.5 };
  assert.deepEqual(plan.moves[0], { start: firstWait, end: firstWait + 400, from: null, to: aim });
  // The click holds its button 90 ms; during the wait after it, the pointer steps aside.
  const pressed = firstWait + 400 + 200;
  assert.deepEqual(
    plan.happenings.map(({ time, kind }) => [time, kind]),
    [
      [pressed, 'press'],
      [pressed + 90, 'release'],
      [pressed + 90 + 600, 'leave'],
    ],
  );
  assert.deepEqual(plan.moves[1], {
    start: pressed + 90 + 120,
    end: pressed + 90 + 340,
    from: aim,
    to: { ...aim, aside: true },
  });
  assert.equal(plan.length, pressed + 90 + 600 + 300);
  // Over the stage from its first move until it leaves, heading where it moved last.
  assert.ok(!presentAt(plan, 0));
  assert.equal(headingAt(plan, pressed)?.selector, '.button');
  assert.equal(headingAt(plan, plan.length), null);
});

test('typing plans one character at a time, and a stayed press keeps the pointer still', () => {
  const plan = planOf([
    { to: '.field' },
    { click: true, stay: true },
    { wait: 1000 },
    { type: 'ab', into: '.field', every: 100 },
    { key: 'Enter', on: '.send' },
  ]);
  assert.equal(plan.moves.length, 1);
  const typed = plan.happenings.filter(({ kind }) => kind === 'type');
  assert.deepEqual(
    typed.map(({ time, text }) => [time, text]),
    [
      [90 + 1000 + 80, 'a'],
      [90 + 1000 + 160, 'b'],
    ],
  );
  assert.deepEqual(aimsOf(plan), ['.field', '.send']);
});
