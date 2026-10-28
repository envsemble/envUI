// forms/internal/CalendarDays: the minutes a time list offers, the entry typed keys name, and the
// YYYY-MM months of MonthPicker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/CalendarDays.mjs');
await build({
  absWorkingDir: repository,
  entryPoints: [join(repository, 'packages/ui/src/forms/internal/calendarDays.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: output,
  logLevel: 'error',
});
const {
  minuteStepOf,
  minuteSteps,
  roundToStep,
  matchTyped,
  parseMonth,
  formatMonth,
  monthOfDay,
  monthFirstDay,
  parseDay,
  formatDay,
} = await import(pathToFileURL(output).href);

test('the step is a whole number of minutes from 1 to 60, 15 by default', () => {
  assert.equal(minuteStepOf(undefined), 15);
  assert.equal(minuteStepOf(Number.NaN), 15);
  assert.equal(minuteStepOf(0), 1);
  assert.equal(minuteStepOf(-5), 1);
  assert.equal(minuteStepOf(7.4), 7);
  assert.equal(minuteStepOf(90), 60);
});

test('the minute column offers every step of the hour', () => {
  assert.deepEqual(minuteSteps(15), [0, 15, 30, 45]);
  assert.equal(minuteSteps(1).length, 60);
  assert.deepEqual(minuteSteps(60), [0]);
  // A step that doesn't divide the hour stops before it.
  assert.deepEqual(minuteSteps(25), [0, 25, 50]);
});

test('a chosen minute between steps takes its place in order, once', () => {
  assert.deepEqual(minuteSteps(15, 40), [0, 15, 30, 40, 45]);
  assert.deepEqual(minuteSteps(15, 50), [0, 15, 30, 45, 50]);
  // On a step, or outside the hour, it adds nothing.
  assert.deepEqual(minuteSteps(15, 45), [0, 15, 30, 45]);
  assert.deepEqual(minuteSteps(15, undefined), [0, 15, 30, 45]);
  assert.deepEqual(minuteSteps(15, 60), [0, 15, 30, 45]);
});

test('a time moves to the nearest step, on into the next hour', () => {
  assert.equal(roundToStep(10 * 60 + 7, 15), 10 * 60);
  assert.equal(roundToStep(10 * 60 + 8, 15), 10 * 60 + 15);
  assert.equal(roundToStep(10 * 60 + 53, 15), 11 * 60);
  assert.equal(roundToStep(23 * 60 + 58, 5), 0);
  assert.equal(roundToStep(9 * 60 + 41, 1), 9 * 60 + 41);
});

test('typed keys name the first entry that starts with them and can be chosen', () => {
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    keys: [String(hour).padStart(2, '0'), String(hour)],
    disabled: hour < 8,
  }));
  assert.equal(matchTyped('9', hours), 9);
  assert.equal(matchTyped('09', hours), 9);
  assert.equal(matchTyped('1', hours), 10);
  assert.equal(matchTyped('14', hours), 14);
  // Unavailable entries are passed over.
  assert.equal(matchTyped('0', hours), 8);
  assert.equal(matchTyped('7', hours), -1);
  assert.equal(matchTyped('99', hours), -1);
  const periods = [{ keys: ['am', 'a'] }, { keys: ['pm', 'p'] }];
  assert.equal(matchTyped('p', periods), 1);
});

test('months are YYYY-MM, counted from January of year 0', () => {
  assert.equal(parseMonth('2026-10'), 2026 * 12 + 9);
  assert.equal(formatMonth(2026 * 12 + 9), '2026-10');
  assert.equal(formatMonth(parseMonth('0001-01')), '0001-01');
  for (const invalid of [
    '2026-13',
    '2026-00',
    '2026-1',
    '26-10',
    '2026-10-01',
    '',
    null,
    undefined,
  ])
    assert.equal(parseMonth(invalid), undefined);
  assert.equal(monthOfDay(parseDay('2026-10-14')), parseMonth('2026-10'));
  assert.equal(formatDay(monthFirstDay(parseMonth('2026-10'))), '2026-10-01');
  assert.equal(formatDay(monthFirstDay(parseMonth('1969-12'))), '1969-12-01');
});
