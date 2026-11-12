// DatePicker and Calendar, rendered on the server: days before 1970, a locale with a calendar of its
// own, fields named by other text or showing their placeholder, and disabled, read-only and invalid
// fields.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { descriptions, elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';

const { Calendar, DatePicker } = await importSource('DatePicker', 'packages/ui/src/index.ts');

const render = (component, props) => firstElement(renderToStaticMarkup(h(component, props)));
const all = (root, test) => elementsOf(root).filter(test);
const byClass = (root, name) => all(root, (element) => hasClass(element, name));
const trigger = (root) => all(root, (element) => element.attributes.role === 'combobox')[0];
/** A calendar's grid, named by its month's title. */
function grid(root) {
  const [table] = all(root, (element) => element.attributes.role === 'grid');
  const title = all(
    root,
    (element) => element.attributes.id === table.attributes['aria-labelledby'],
  );
  return { table, name: textOf(title[0]) };
}
const day = (root, date) => all(root, (element) => element.attributes['data-date'] === date)[0];
const dayName = (root, date) => {
  const cell = day(root, date);
  return cell.attributes['aria-label'] ?? textOf(cell);
};

test('days before 1970 keep their date and time', () => {
  const launch = render(DatePicker, {
    label: 'Launch',
    locale: 'en-GB',
    granularity: 'minute',
    value: '1969-12-20T09:30',
    onValueChange: () => undefined,
  });
  assert.equal(textOf(byClass(launch, 'env-date-picker-value')[0]), '20 Dec 1969, 09:30');
  assert.equal(
    all(launch, (element) => element.tag === 'input')[0].attributes.value,
    '1969-12-20T09:30',
  );
  const calendar = render(Calendar, {
    'aria-label': 'Launch',
    locale: 'en-GB',
    defaultValue: '1969-12-20',
  });
  const { table, name } = grid(calendar);
  assert.equal(name, 'December 1969');
  assert.equal(textOf(all(table, (element) => element.tag === 'th')[0]), 'Mo');
  assert.match(dayName(calendar, '1969-12-01'), /Monday,? 1 December 1969/);
  assert.equal(day(calendar, '1969-12-20').attributes['aria-selected'], 'true');
});

test('a locale with a calendar of its own names the Gregorian months the grid shows', () => {
  const persian = render(Calendar, {
    'aria-label': 'Persian planner',
    locale: 'fa-IR',
    defaultValue: '2026-10-14',
  });
  const format = (options) =>
    new Intl.DateTimeFormat('fa-IR', { ...options, calendar: 'gregory', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2026, 9, 14)),
    );
  assert.equal(grid(persian).name, format({ month: 'long', year: 'numeric' }));
  assert.equal(
    dayName(persian, '2026-10-14'),
    format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );
  assert.equal(textOf(byClass(day(persian, '2026-10-14'), 'env-calendar-day-mark')[0]), '۱۴');
});

test('a field named by other text, and one without a label that shows its placeholder', () => {
  const starts = render(DatePicker, { 'aria-labelledby': 'starts', locale: 'en-GB' });
  assert.equal(trigger(starts).attributes['aria-labelledby'], 'starts');
  assert.equal(all(starts, (element) => element.tag === 'label').length, 0);
  // Without a label to rest in the field, its placeholder shows.
  const ends = render(DatePicker, {
    'aria-label': 'Ends',
    placeholder: 'Pick an end',
    locale: 'en-GB',
  });
  assert.equal(trigger(ends).attributes['aria-label'], 'Ends');
  assert.equal(textOf(byClass(ends, 'env-date-picker-placeholder')[0]), 'Pick an end');
});

test('disabled, read-only and invalid fields', () => {
  const disabled = render(DatePicker, {
    label: 'Disabled date',
    locale: 'en-GB',
    defaultValue: '2026-10-20',
    disabled: true,
  });
  assert.ok('disabled' in trigger(disabled).attributes);
  const readOnly = render(DatePicker, {
    label: 'Read only date',
    locale: 'en-GB',
    defaultValue: '2026-10-20',
    readOnly: true,
  });
  assert.equal(trigger(readOnly).attributes['aria-readonly'], 'true');
  assert.equal(textOf(byClass(readOnly, 'env-date-picker-value')[0]), '20 Oct 2026');
  const invalid = render(DatePicker, {
    label: 'Invalid date',
    locale: 'en-GB',
    error: 'Choose a later day.',
  });
  assert.equal(trigger(invalid).attributes['aria-invalid'], 'true');
  assert.deepEqual(descriptions(invalid, trigger(invalid)), ['Choose a later day.']);
});
