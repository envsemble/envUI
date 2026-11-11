// TimePicker's clock in its markup: the field's time in the locale, the wheels in the order the
// locale writes a time, a day-period wheel only on a 12-hour clock, hourCycle in place of the
// locale's clock, and the field's disabled, read-only and invalid states. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.mjs';
import { descriptions, elementsOf, firstElement, textOf } from '../../support/Markup.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { TimePicker, DatePicker, TimeList } = await importSource('TimePicker', [
  "export { TimePicker } from './packages/ui/src/forms/TimePicker.tsx';",
  "export { DatePicker } from './packages/ui/src/forms/DatePicker.tsx';",
  "export { TimeList } from './packages/ui/src/forms/internal/TimeList.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const withRole = (root, role) =>
  elementsOf(root).filter((element) => element.attributes.role === role);
/** The field's trigger and what it shows. */
function field(props, Picker = TimePicker) {
  const root = render(h(Picker, props));
  const [trigger] = withRole(root, 'combobox');
  return { root, trigger, text: textOf(trigger).replace(/\s/g, ' ') };
}
/** The wheels a time's popup shows, by name, with their value text and range. */
function wheels(props) {
  return withRole(
    render(h(TimeList, { 'aria-label': 'Time', onValueChange: () => {}, ...props })),
    'spinbutton',
  ).map(({ attributes }) => ({
    name: attributes['aria-label'],
    text: attributes['aria-valuetext'],
    min: attributes['aria-valuemin'],
    max: attributes['aria-valuemax'],
  }));
}
const names = (props) => wheels(props).map((wheel) => wheel.name);

test('a 12-hour locale adds its day periods, in the order it writes them', () => {
  assert.equal(field({ label: 'Reminder', locale: 'en-US', value: '14:00' }).text, '2:00 PM');
  const reminder = wheels({ locale: 'en-US', value: 14 * 60 });
  assert.deepEqual(
    reminder.map(({ name, text }) => [name, text]),
    [
      ['Hours', '2'],
      ['Minutes', '00'],
      ['AM/PM', 'PM'],
    ],
  );
  // Korean writes the day period first, and so do its wheels; German has a 24-hour clock.
  assert.deepEqual(names({ locale: 'ko-KR', value: 14 * 60 + 30 }), ['AM/PM', 'Hours', 'Minutes']);
  assert.equal(field({ label: 'Abfahrt', locale: 'de-DE', defaultValue: '18:45' }).text, '18:45');
  assert.deepEqual(names({ locale: 'de-DE', value: 18 * 60 + 45 }), ['Hours', 'Minutes']);
});

test('hourCycle sets the clock whatever the locale writes', () => {
  // en-US on the 24-hour clock: 18:45, with hours from 00 to 23 and no AM/PM wheel.
  assert.equal(
    field({ label: 'Rota', locale: 'en-US', hourCycle: 'h23', defaultValue: '18:45' }).text,
    '18:45',
  );
  const [hours, ...rest] = wheels({ locale: 'en-US', hourCycle: 'h23', value: 18 * 60 + 45 });
  assert.deepEqual(hours, { name: 'Hours', text: '18', min: '0', max: '23' });
  assert.deepEqual(
    rest.map((wheel) => wheel.name),
    ['Minutes'],
  );
  // en-GB on the 12-hour clock, as it writes one: 06:45 pm, with its day periods.
  assert.match(
    field({ label: 'Twelve-hour', locale: 'en-GB', hourCycle: 'h12', defaultValue: '18:45' }).text,
    /^06:45 pm$/i,
  );
  const twelve = wheels({ locale: 'en-GB', hourCycle: 'h12', value: 18 * 60 + 45 });
  assert.deepEqual(
    twelve.map((wheel) => wheel.name),
    ['Hours', 'Minutes', 'AM/PM'],
  );
  assert.equal(twelve[0].text, '06');
  // A date and a time takes it too.
  assert.equal(
    field(
      {
        label: 'Shift start',
        granularity: 'minute',
        locale: 'en-US',
        hourCycle: 'h23',
        defaultValue: '2026-10-21T18:00',
      },
      DatePicker,
    ).text,
    'Oct 21, 2026, 18:00',
  );
});

test('disabled, read-only and invalid fields', () => {
  const disabled = field({
    label: 'Disabled time',
    locale: 'en-GB',
    defaultValue: '12:00',
    disabled: true,
  });
  assert.equal(disabled.trigger.attributes.disabled, '');
  const readOnly = field({
    label: 'Read only time',
    locale: 'en-GB',
    defaultValue: '12:00',
    readOnly: true,
  });
  assert.equal(readOnly.trigger.attributes['aria-readonly'], 'true');
  assert.equal(readOnly.text, '12:00');
  const invalid = field({ label: 'Invalid time', locale: 'en-GB', error: 'Choose a later time.' });
  assert.equal(invalid.trigger.attributes['aria-invalid'], 'true');
  assert.deepEqual(descriptions(invalid.root, invalid.trigger), ['Choose a later time.']);
});
