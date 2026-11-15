import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';

const { calendarHeatmapModel, heatmapKeyTarget } = await importSource(
  'CalendarHeatmapModel',
  'packages/ui/src/data-display/internal/calendarHeatmapModel.ts',
);

const model = (data: unknown, options = {}) =>
  calendarHeatmapModel({
    data,
    startDate: undefined,
    endDate: undefined,
    levels: 5,
    maxValue: undefined,
    thresholdsKey: undefined,
    weekStart: 1,
    formatValue: String,
    formatDate: (date: string) => date,
    monthLabels: Array.from({ length: 12 }, (_, index) => String(index + 1)),
    ...options,
  });

test('a date that does not exist is left out and reported, not moved to another day', () => {
  const result = model([
    { date: '2026-02-27', value: 1 },
    { date: '2026-02-31', value: 9 },
    { date: '2026-03-03', value: 2 },
  ]);
  assert.deepEqual(result.invalid, ['2026-02-31']);
  const dates = [...result.days.values()].map((day) => day.date);
  assert.ok(dates.includes('2026-03-03'));
  const third = [...result.days.values()].find((day) => day.date === '2026-03-03');
  assert.equal(third.value, 2);
});

test('an unreadable start or end date is reported too', () => {
  const result = model([{ date: '2026-03-03', value: 2 }], { startDate: '2026-13-01' });
  assert.deepEqual(result.invalid, ['2026-13-01']);
});

test('the weeks start on the given weekday, any of the seven', () => {
  const result = model([{ date: '2026-03-04', value: 1 }], { weekStart: 3 });
  assert.equal(result.first, result.start);
});

test('Page Up and Page Down go to the first and last day of the week, within the range', () => {
  const result = model([], { startDate: '2026-03-04', endDate: '2026-03-18' });
  const key = (active: unknown, name: string) =>
    heatmapKeyTarget(result, active, { key: name, ctrlKey: false }, false) - result.start;
  assert.equal(key(result.start + 9, 'PageUp'), 5);
  assert.equal(key(result.start + 9, 'PageDown'), 11);
  assert.equal(key(result.start + 2, 'PageUp'), 0);
  assert.equal(key(result.start + 13, 'PageDown'), 14);
});
