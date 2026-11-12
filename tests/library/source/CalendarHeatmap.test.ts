// CalendarHeatmap's markup, rendered on the server: a grid of named days with a single tab stop,
// its labels, weeks and locale, the levels its values and thresholds give, and an update that
// rescales them. Names are in British English, from Intl, with a comma after the weekday in some
// runtimes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';

const { CalendarHeatmap, EnvUIProvider } = await importSource(
  'CalendarHeatmap',
  'packages/ui/src/index.ts',
);

/** A deterministic year of activity, as the component tests' fixture has it. */
function activity(end, days, seed) {
  const last = Date.parse(`${end}T00:00:00Z`);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(last - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10);
    const wave = Math.sin((index + seed) / 6) + Math.sin((index * 7 + seed) / 17);
    return { date, value: Math.max(0, Math.round(wave * 4)) };
  });
}
const year = activity('2026-10-10', 365, 3);

/** The heatmap's root, rendered in a locale. */
const render = (props, locale = 'en-GB', messages) =>
  firstElement(
    renderToStaticMarkup(h(EnvUIProvider, { locale, messages }, h(CalendarHeatmap, props))),
  );
const all = (root, test) => elementsOf(root).filter(test);
const byClass = (root, name) => all(root, (element) => hasClass(element, name));
const days = (root) => all(root, (element) => element.attributes.role === 'gridcell');
const day = (root, date) => days(root).find((cell) => cell.attributes['data-date'] === date);
const level = (root, date) => day(root, date)?.attributes['data-level'];
const labels = (root, name) =>
  byClass(root, name).flatMap((cell) =>
    cell.children.filter((child) => child.tag === 'span').map(textOf),
  );

test('a year of days is one grid with named cells and a single tab stop', () => {
  const heatmap = render({ weekStart: 0, 'aria-label': 'Activity', data: year });
  const [grid] = all(heatmap, (element) => element.attributes.role === 'grid');
  assert.equal(grid.attributes['aria-label'], 'Activity');
  assert.equal(grid.attributes['aria-readonly'], 'true');
  const cells = days(grid);
  assert.equal(cells.length, 365);
  const stops = cells.filter((cell) => cell.attributes.tabindex === '0');
  assert.equal(stops.length, 1);
  assert.match(stops[0].attributes['aria-label'], /^Sat,? 10 Oct 2026: 0$/);
  // Rows run by weekday: the first row holds the Sundays.
  const [firstRow] = all(grid, (element) => element.tag === 'tbody')[0].children;
  assert.match(days(firstRow)[0].attributes['aria-label'], /^Sun,? 12 Oct 2025: \d+$/);
  assert.match(day(grid, '2025-10-11').attributes['aria-label'], /^Sat,? 11 Oct 2025: \d+$/);
  // Month and weekday names are visual; each day names its own date.
  assert.equal(
    all(grid, (element) => element.tag === 'thead')[0].attributes['aria-hidden'],
    'true',
  );
  assert.equal(labels(grid, 'env-calendar-heatmap-month')[0], 'Oct');
  assert.deepEqual(labels(grid, 'env-calendar-heatmap-weekday'), ['Mon', 'Wed', 'Fri']);
  const [legend] = byClass(heatmap, 'env-calendar-heatmap-legend');
  assert.equal(legend.attributes['aria-hidden'], 'true');
  assert.equal(textOf(legend), 'LessMore');
  assert.equal(byClass(legend, 'env-calendar-heatmap-swatch').length, 5);
  // No tooltip is in the markup at rest.
  assert.equal(byClass(heatmap, 'env-tooltip-positioner').length, 0);
});

test('an update rescales the days', () => {
  const before = render({ weekStart: 0, 'aria-label': 'Activity', data: year });
  const updated = year.map((each) => (each.date === '2026-10-10' ? { ...each, value: 20 } : each));
  const after = render({ weekStart: 0, 'aria-label': 'Activity', data: updated });
  assert.equal(level(before, '2026-10-10'), '0');
  assert.equal(level(after, '2026-10-10'), '4');
  assert.match(day(after, '2026-10-10').attributes['aria-label'], /^Sat,? 10 Oct 2026: 20$/);
  // With a larger maximum, fewer days reach the strongest step.
  const strongest = (root) => days(root).filter((cell) => cell.attributes['data-level'] === '4');
  assert.ok(strongest(after).length < strongest(before).length);
});

test('custom labels, weeks from Monday, levels and a tone', () => {
  const heatmap = render({
    'aria-label': 'Deployments',
    data: [
      { date: '2026-03-02', value: 1 },
      { date: '2026-03-03', value: 4, label: '4 deployments' },
      { date: '2026-03-10', value: 2 },
      { date: '2026-03-24', value: 8 },
    ],
    startDate: '2026-03-01',
    endDate: '2026-04-04',
    weekStart: 1,
    levels: 3,
    maxValue: 8,
    tone: 'success',
    monthLabels: [
      'Jan',
      'Feb',
      'Mär',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Okt',
      'Nov',
      'Dez',
    ],
    weekdayLabels: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    lessLabel: 'Weniger',
    moreLabel: 'Mehr',
  });
  assert.equal(days(heatmap).length, 35);
  assert.deepEqual(labels(heatmap, 'env-calendar-heatmap-weekday'), ['Mo', 'Mi', 'Fr']);
  assert.deepEqual(labels(heatmap, 'env-calendar-heatmap-month'), ['Mär']);
  // The first week starts on Monday 23 February; only Sunday 1 March is in range.
  const rows = all(heatmap, (element) => element.tag === 'tbody')[0].children;
  assert.deepEqual(
    rows.map((row) => row.children[1].attributes['aria-label'] ?? null),
    [null, null, null, null, null, null, 'So 1 Mär 2026: 0'],
  );
  assert.equal(day(heatmap, '2026-03-03').attributes['aria-label'], 'Di 3 Mär 2026: 4 deployments');
  assert.equal(level(heatmap, '2026-03-03'), '1');
  assert.equal(level(heatmap, '2026-03-24'), '2');
  // The strongest step is the tone itself.
  assert.equal(heatmap.attributes['data-tone'], 'success');
  assert.equal(day(heatmap, '2026-03-24').attributes.style, '--env-calendar-heatmap-mix:100%');
  assert.equal(textOf(byClass(heatmap, 'env-calendar-heatmap-legend')[0]), 'WenigerMehr');
});

test("names, dates and values follow the provider's locale, and the legend its messages", () => {
  const heatmap = render(
    {
      weekStart: 0,
      'aria-label': 'Provided',
      data: [{ date: '2026-10-06', value: 1234 }],
      startDate: '2026-10-04',
      endDate: '2026-10-17',
    },
    'de-DE',
    { calendarHeatmap: { less: 'Wenig', more: 'Viel' } },
  );
  const utc = { timeZone: 'UTC' };
  const format = (options, date) =>
    new Intl.DateTimeFormat('de-DE', { ...options, ...utc }).format(date);
  assert.equal(
    labels(heatmap, 'env-calendar-heatmap-month')[0],
    format({ month: 'short' }, Date.UTC(2026, 9, 1)),
  );
  assert.equal(
    labels(heatmap, 'env-calendar-heatmap-weekday')[0],
    format({ weekday: 'short' }, Date.UTC(2026, 9, 5)),
  );
  assert.equal(
    day(heatmap, '2026-10-06').attributes['aria-label'],
    `${format({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }, Date.UTC(2026, 9, 6))}: 1.234`,
  );
  assert.equal(textOf(byClass(heatmap, 'env-calendar-heatmap-legend')[0]), 'WenigViel');
});

test('thresholds set the color steps, for example to color days by rank', () => {
  const heatmap = render({
    weekStart: 0,
    'aria-label': 'Ranked',
    data: [
      { date: '2026-05-04', value: 5 },
      { date: '2026-05-05', value: 15 },
      { date: '2026-05-06', value: 25 },
      { date: '2026-05-07', value: 45 },
      { date: '2026-05-08', value: 0.5 },
    ],
    startDate: '2026-05-03',
    endDate: '2026-05-16',
    thresholds: [40, 1, 20, 10],
  });
  // Thresholds in any order: 1, 10, 20 and 40 start the four steps above the empty one.
  assert.deepEqual(
    ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07'].map((date) => level(heatmap, date)),
    ['1', '2', '3', '4'],
  );
  // Below the first threshold a day shows as empty, like a day without data.
  assert.equal(level(heatmap, '2026-05-08'), '0');
  assert.equal(level(heatmap, '2026-05-09'), '0');
  assert.equal(byClass(heatmap, 'env-calendar-heatmap-swatch').length, 5);
});

test('explicit thresholds color days of 0, and two levels color their only step in the tone', () => {
  const fromZero = render({
    weekStart: 0,
    'aria-label': 'From zero',
    data: [
      { date: '2026-05-04', value: 0 },
      { date: '2026-05-05', value: 10 },
      { date: '2026-05-06', value: -2 },
    ],
    startDate: '2026-05-03',
    endDate: '2026-05-09',
    thresholds: [0, 10],
  });
  // A first threshold of 0 colors days of 0, with or without data; values below it stay empty.
  assert.equal(level(fromZero, '2026-05-04'), '1');
  assert.equal(level(fromZero, '2026-05-03'), '1');
  assert.equal(level(fromZero, '2026-05-05'), '2');
  assert.equal(level(fromZero, '2026-05-06'), '0');
  const two = render({
    weekStart: 0,
    'aria-label': 'Two steps',
    data: [
      { date: '2026-05-04', value: 3 },
      { date: '2026-05-05', value: 0 },
    ],
    startDate: '2026-05-03',
    endDate: '2026-05-09',
    levels: 2,
  });
  assert.equal(level(two, '2026-05-05'), '0');
  assert.equal(level(two, '2026-05-04'), '1');
  assert.equal(day(two, '2026-05-04').attributes.style, '--env-calendar-heatmap-mix:100%');
});
