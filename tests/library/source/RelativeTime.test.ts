// RelativeTime's words and its shared clock, on a fake clock from one moment: how a moment reads,
// past or coming, in each format and language; the one timer that keeps every mounted time current;
// and the time element the server renders.
import { afterEach, beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { firstElement, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { RelativeTime, EnvUIProvider, formatRelativeTime, subscribeToClock } = await importSource(
  'RelativeTime',
  [
    "export { RelativeTime } from './packages/ui/src/data-display/RelativeTime.tsx';",
    "export { formatRelativeTime } from './packages/ui/src/data-display/formatRelativeTime.ts';",
    "export { subscribeToClock } from './packages/ui/src/data-display/internal/relativeTimeClock.ts';",
    "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
  ],
);

const second = 1_000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const opened = Date.parse('2026-10-14T09:00:00Z');

// The text never depends on the runtime's own language, which differs between machines.
const locale = 'en-US';

beforeEach(() => mock.timers.enable({ apis: ['setTimeout', 'Date'], now: opened }));
afterEach(() => mock.timers.reset());

/**
 * Moments followed as mounted RelativeTimes follow them: each subscribed to the shared clock by its
 * time, its text read again on each tick. `set` gives one a new moment, as a new value does.
 */
function follow(moments) {
  const texts = {};
  const subscriptions = new Map();
  const set = (name, value) => {
    subscriptions.get(name)?.();
    const read = () => (texts[name] = formatRelativeTime(value, { locale }));
    read();
    subscriptions.set(name, subscribeToClock(new Date(value).getTime(), read));
  };
  for (const [name, value] of Object.entries(moments)) set(name, value);
  return { texts, set, stop: () => subscriptions.forEach((unsubscribe) => unsubscribe()) };
}

test('relative times read naturally for past and coming moments and keep up with the clock', () => {
  const fixed = { value: '2026-10-16T12:00:00Z', now: Date.parse('2026-10-14T12:00:00Z') };
  const clock = follow({
    'seconds-ago': opened - 30 * second,
    'seconds-ahead': opened + 20 * second,
    'minutes-ago': opened - 90 * second,
    'hours-ago': opened - 3 * hour,
    'days-ahead': opened + 2 * day,
    'weeks-ago': opened - 15 * day,
    'from-string': new Date(opened + 5 * day).toISOString(),
  });
  try {
    // Ten seconds after the moments were taken.
    mock.timers.tick(10 * second);
    assert.deepEqual(clock.texts, {
      'seconds-ago': 'just now',
      'seconds-ahead': 'now',
      'minutes-ago': '2 minutes ago',
      'hours-ago': '3 hours ago',
      'days-ahead': 'in 2 days',
      'weeks-ago': '2 weeks ago',
      'from-string': 'in 5 days',
    });
    // Twenty seconds later the second ticks have moved both moments past the threshold.
    mock.timers.tick(20 * second);
    assert.equal(clock.texts['seconds-ago'], '1 minute ago');
    assert.equal(clock.texts['seconds-ahead'], 'just now');
    assert.equal(clock.texts['hours-ago'], '3 hours ago');
    // Half an hour later the minute ticks have rounded the hours up.
    mock.timers.tick(31 * minute);
    assert.equal(clock.texts['seconds-ago'], '32 minutes ago');
    assert.equal(clock.texts['hours-ago'], '4 hours ago');
    assert.equal(clock.texts['days-ahead'], 'in 2 days');
  } finally {
    clock.stop();
  }
  // A fixed now keeps its text, whatever the clock says.
  assert.equal(formatRelativeTime(fixed.value, { now: fixed.now, locale }), 'in 2 days');
  assert.equal(
    formatRelativeTime(fixed.value, { now: new Date(fixed.now), locale: 'de' }),
    'in 2 Tagen',
  );
});

test('a time follows a new value with the shared clock', () => {
  const clock = follow({ hours: opened - 3 * hour, saved: opened - 2 * hour });
  try {
    assert.equal(clock.texts.saved, '2 hours ago');
    // Saved again: the new moment ticks with the others.
    clock.set('saved', Date.now());
    assert.equal(clock.texts.saved, 'just now');
    mock.timers.tick(2 * minute);
    assert.equal(clock.texts.saved, '2 minutes ago');
    mock.timers.tick(10 * minute);
    assert.equal(clock.texts.saved, '12 minutes ago');
  } finally {
    clock.stop();
  }
});

test('formats, languages and the time element', () => {
  const now = opened + 10 * second;
  mock.timers.setTime(now);
  const format = (time, options) => formatRelativeTime(time, { locale, ...options });
  assert.equal(format(opened - 3 * hour, { format: 'short' }), '3 hr. ago');
  assert.equal(format(opened + 2 * day, { format: 'narrow' }), 'in 2d');
  assert.equal(format(opened - 3 * hour, { locale: 'de' }), 'vor 3 Stunden');
  assert.equal(format(opened - 5 * second, { locale: 'de' }), 'jetzt');
  assert.equal(format(opened - 5 * second, { nowLabel: 'moments ago' }), 'moments ago');
  assert.equal(format(opened + 3 * hour, { now: opened, format: 'short' }), 'in 3 hr.');

  const render = (element) => firstElement(renderToStaticMarkup(element));
  // EnvUIProvider's locale and now message; a time's own locale wins.
  const provided = (props) =>
    textOf(
      render(
        h(
          EnvUIProvider,
          { locale: 'de', messages: { relativeTime: { now: 'gerade eben' } } },
          h(RelativeTime, { tooltip: false, ...props }),
        ),
      ),
    );
  assert.equal(provided({ value: opened - 3 * hour }), 'vor 3 Stunden');
  assert.equal(provided({ value: opened - 5 * second }), 'gerade eben');
  assert.equal(provided({ value: opened - 3 * hour, locale: 'en' }), '3 hours ago');
  // The element carries the exact moment; an invalid moment renders nothing.
  const fixed = render(
    h(RelativeTime, {
      value: '2026-10-16T12:00:00Z',
      now: Date.parse('2026-10-14T12:00:00Z'),
      locale,
    }),
  );
  assert.equal(fixed.tag, 'time');
  assert.equal(fixed.attributes.dateTime, '2026-10-16T12:00:00.000Z');
  assert.equal(textOf(fixed), 'in 2 days');
  assert.equal(renderToStaticMarkup(h(RelativeTime, { value: 'not a date' })), '');
  // An invalid now is left out, and the text follows the clock.
  assert.equal(
    textOf(render(h(RelativeTime, { value: opened - 3 * hour, now: Number.NaN, locale }))),
    '3 hours ago',
  );
});
