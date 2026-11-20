import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { installTimeout, packedConsumer } from '../../support/PackedConsumer.ts';

let consumer;
let ssr;
before(
  async () => {
    consumer = await packedConsumer();
    ssr = await consumer.runScript(
      'SSRConsumer.mjs',
      `
    import { createElement as h } from 'react';
    import { renderToString } from 'react-dom/server';
    import * as ui from '@envsemble/envui';
    import * as color from '@envsemble/envui/color';
    import { IconHome } from '@envsemble/envui/icons/Home';
    if (typeof document !== 'undefined' || typeof window !== 'undefined') throw new Error('DOM globals must be absent');
    function ThemeProbe() { return h('span', { 'data-originating-theme': ui.useTheme().theme }); }
    const custom = h(ui.Icon, { label: 'Custom star', viewBox: '0 0 8 8' }, h('path', { d: 'M0 0L8 8' }));
    const html = renderToString(h(ui.Theme, { theme: 'dark' },
      h(ThemeProbe),
      h(ui.Button, { start: h(IconHome) }, 'Create'),
      h(ui.IconButton, { icon: custom, 'aria-label': 'Open item' }),
      h(ui.ButtonGroup, { orientation: 'vertical', 'aria-label': 'Connected actions' },
        h(ui.Button, { start: h(IconHome) }, 'Continue'),
        h(ui.IconButton, { icon: custom, 'aria-label': 'Settings' }),
        h(ui.Button, { variant: 'primary', tone: 'accent', href: '/confirm' }, 'Confirm')),
      h(ui.Pager.Previous, { href: '/previous-guide' }, 'Earlier guide'),
      h(ui.Pager.Next, { href: '/next-guide', end: custom }, 'Following guide'),
      h(ui.TextField, { name: 'title', label: 'Title', description: 'One line', defaultValue: 'Example' }),
      h(color.ColorPicker, { name: 'accent', label: 'Accent color', defaultValue: '#ABCDEF', alpha: true }),
      h(color.ColorPickerButton, { name: 'border', label: 'Border color', defaultValue: '#123456' }),
      h(color.ColorSwatch, { color: '#6750a4', format: 'rgb', label: 'Violet' }),
      h(ui.Textarea, { name: 'description', label: 'Description', defaultValue: 'Content' }),
      h(ui.Checkbox, { name: 'enabled', label: 'Enabled', defaultChecked: true }),
      h(ui.Switch, { name: 'alerts', label: 'Alerts' }),
      h(ui.RadioGroup, { name: 'mode', label: 'Mode', defaultValue: 'one' }, h(ui.Radio, { value: 'one', label: 'One' })),
      h(ui.Select, { name: 'choice', label: 'Choice', items: [{ value: 'one', label: 'One' }], defaultValue: 'one' }),
      h(ui.Combobox, { name: 'owner', label: 'Owner', items: [{ value: 'first', label: 'First person' }], defaultValue: 'first' }),
      h(ui.Combobox, { name: 'reviewers', label: 'Reviewers', multiple: true, items: [{ label: 'Team', items: [{ value: 'second', label: 'Second person' }] }], defaultValue: ['second'] }),
      h(ui.DatePicker, { name: 'due', label: 'Due', defaultValue: '2026-10-14T09:30', granularity: 'minute', locale: 'en-GB' }),
      h(ui.Calendar, { 'aria-label': 'Planning', defaultValue: '2026-03-09', locale: 'en-GB', weekStart: 1 }),
      h(ui.Dialog, { title: 'Example', open: false, trigger: h(ui.Button, null, 'Open') }),
      h(ui.ToastProvider, null, 'Managed notifications'),
      h(ui.Spinner, { label: 'Loading projects', showLabel: true }),
      h(ui.Card, { skeleton: true, title: ui.placeholders(1)[0].title }, h(ui.Text))
    ));
    console.log(JSON.stringify({
      html,
      defaultIcon: renderToString(h(IconHome)), filledIcon: renderToString(h(IconHome, { filled: true, label: 'Home' })),
      customIcon: renderToString(custom),
    }));
  `,
    );
  },
  { timeout: installTimeout },
);

test('public components import and render on a server with no DOM globals', () => {
  assert.match(ssr.html, /role="group" aria-labelledby="[^"]+-label"[^>]*class="env-color-picker"/);
  assert.match(ssr.html, /aria-label="Hex"/);
  assert.match(ssr.html, /name="accent"[^>]*value="#abcdef"/);
  assert.match(ssr.html, /aria-label="Border color, #123456"/);
  assert.match(
    ssr.html,
    /class="env-color-swatch-label"[^>]*>Violet<\/span><span class="env-color-swatch-value">rgb\(103, 80, 164\)/,
    'A color swatch writes its label and its value in the format asked for.',
  );
  assert.match(ssr.html, /data-env-theme="dark"/);
  assert.match(ssr.html, /data-originating-theme="dark"/);
  assert.match(
    ssr.html,
    /aria-label="Connected actions" role="group" class="env-button-group" data-orientation="vertical"/,
  );
  assert.match(ssr.html, /<a href="\/previous-guide" rel="prev"/);
  assert.match(ssr.html, /<a href="\/next-guide" rel="next"/);
  assert.match(ssr.html, /Up next/);
  assert.match(ssr.html, /name="title"/);
  assert.match(ssr.html, /role="switch"/);
  assert.match(ssr.html, /name="mode"/);
  assert.match(
    ssr.html,
    /role="combobox"[^>]*value="First person"|value="First person"[^>]*role="combobox"/,
  );
  assert.match(ssr.html, /name="owner"[^>]*value="first"|value="first"[^>]*name="owner"/);
  assert.match(ssr.html, /<input type="hidden"[^>]*name="reviewers" value="second"/);
  assert.match(ssr.html, /Second person/);
  assert.match(ssr.html, /14 Oct 2026, 09:30/);
  assert.match(
    ssr.html,
    /name="due"[^>]*value="2026-10-14T09:30"|value="2026-10-14T09:30"[^>]*name="due"/,
  );
  assert.match(ssr.html, /role="group" aria-label="Planning"/);
  assert.match(ssr.html, /role="grid"/);
  assert.match(ssr.html, /aria-selected="true"[^>]*data-date="2026-03-09"/);
  assert.match(ssr.html, /role="status"/);
  assert.match(ssr.html, /<span class="env-spinner-label">Loading projects<\/span>/);
  assert.match(
    ssr.html,
    /class="env-card env-surface"[^>]* data-env-skeleton="" aria-busy="true"[^>]*><div class="env-skeleton-content" inert=""><div class="env-card-header"[^>]*><h3 class="env-text env-card-title" data-variant="title"><\/h3>/,
  );
});

test('explicit official icons preserve filled geometry and accept custom SVG content', () => {
  assert.match(ssr.defaultIcon, /aria-hidden="true"/);
  assert.match(ssr.filledIcon, /role="img"/);
  assert.match(ssr.filledIcon, /aria-label="Home"/);
  assert.doesNotMatch(ssr.filledIcon, /aria-hidden="true"/);
  assert.notEqual(ssr.defaultIcon, ssr.filledIcon);
  assert.match(ssr.customIcon, /aria-label="Custom star"/);
});

test('avatar groups, relative times, copy buttons and pagination render on a server and type their contracts', async () => {
  const display = await consumer.runScript(
    'DisplayConsumer.mjs',
    `
    import { createElement as h } from 'react';
    import { renderToString } from 'react-dom/server';
    import * as ui from '@envsemble/envui';
    if (typeof document !== 'undefined' || typeof window !== 'undefined') throw new Error('DOM globals must be absent');
    const people = [{ name: 'Alex Morgan' }, { name: 'Sam Lee' }, { name: 'Priya Shah' }];
    const now = Date.parse('2026-10-14T12:00:00Z');
    const light = (element) => renderToString(h(ui.Theme, { theme: 'light' }, element));
    console.log(JSON.stringify({
      relative: light(h(ui.RelativeTime, { value: '2026-10-16T12:00:00Z', now, locale: 'en' })),
      formatted: [
        ui.formatRelativeTime(now - 3 * 3600000, { now, locale: 'en' }),
        ui.formatRelativeTime(now - 10000, { now, locale: 'en' }),
        ui.formatRelativeTime(now - 3 * 3600000, { now, locale: 'de', format: 'short' }),
        ui.formatRelativeTime('not a date', { now }),
        // An invalid now is ignored, as by RelativeTime: the text follows the clock.
        ui.formatRelativeTime(Date.now() - 3 * 3600000, { now: new Date('not a date'), locale: 'en' }),
      ],
      avatars: light(h(ui.AvatarGroup, { people, max: 2, total: 5 })),
      copy: light(h(ui.CopyButton, { value: 'Copied text', 'aria-label': 'Copy link' })),
      pagination: light(h(ui.Pagination, { page: 2, pageSize: 60, total: 245, onPageChange() {} })),
    }));
  `,
  );
  assert.match(
    display.relative,
    /<time [^>]*datetime="2026-10-16T12:00:00.000Z"[^>]*>in 2 days<\/time>/i,
  );
  assert.match(display.relative, /<time dir="auto"/);
  assert.deepEqual(display.formatted, ['3 hours ago', 'just now', 'vor 3 Std.', '', '3 hours ago']);
  assert.match(
    display.avatars,
    /role="group" aria-label="5 people: Alex Morgan, Sam Lee, Priya Shah, 2 more"/,
  );
  assert.match(display.copy, /<button[^>]*aria-label="Copy link"/);
  assert.match(display.copy, /role="status"/);
  assert.match(display.pagination, />61–120 of 245</);

  await consumer.typecheck(
    'DisplayConsumer',
    `
    import { AvatarGroup, CopyButton, Pagination, RelativeTime, formatRelativeTime,
      type AvatarGroupPerson, type AvatarGroupProps, type CopyButtonProps, type PaginationProps,
      type PaginationRange, type RelativeTimeProps } from '@envsemble/envui';
    const person: AvatarGroupPerson = { name: 'Alex Morgan', id: 7, href: '/people/alex', src: null, fallback: 'initials' };
    const groupProps: AvatarGroupProps = { people: [person], max: 3, size: 'sm', total: 12, formatMore: (count) => count + ' more' };
    const describe = (range: PaginationRange) => range.start + '–' + range.end + ' of ' + (range.total ?? 'many');
    const pagerProps: PaginationProps = { page: 1, pageSize: 10, onPageChange: (page) => { const typed: number = page; void typed; } };
    const timeProps: RelativeTimeProps = { value: new Date(), format: 'narrow', locale: ['de', 'en'], tooltip: false };
    const copyProps: CopyButtonProps = { value: () => Promise.resolve('text'), 'aria-label': 'Copy link', copyLabel: 'Copy' };
    const text: string = formatRelativeTime(Date.now(), { format: 'short', now: new Date() });
    export const display = <>
      <AvatarGroup {...groupProps} onPersonClick={(clicked, event) => { void clicked.name; event.preventDefault(); }} />
      <RelativeTime {...timeProps} nowLabel="moments ago" />
      <CopyButton {...copyProps} onCopied={(copied) => { const typed: string = copied; void typed; }} />
      <CopyButton value="text" size="sm" variant="text">Copy</CopyButton>
      <Pagination {...pagerProps} renderRange={describe} hasNextPage pending size="sm" />
    </>;
    void text;
    // @ts-expect-error
    const iconOnlyCopyButtonNeedsAName = <CopyButton value="text" />;
    // @ts-expect-error
    const falseChildrenLeaveCopyButtonIconOnly = <CopyButton value="text">{false}</CopyButton>;
    // @ts-expect-error
    const nullChildrenLeaveCopyButtonIconOnly = <CopyButton value="text">{null}</CopyButton>;
    const namedWithoutLabel = <CopyButton value="text" aria-label="Copy">{null}</CopyButton>;
    // @ts-expect-error
    const avatarGroupTakesAvatarSizes = <AvatarGroup people={[]} size="huge" />;
    // @ts-expect-error
    const paginationAsksForPages = <Pagination page={1} pageSize={10} />;
    // @ts-expect-error
    const relativeTimeHasThreeFormats = <RelativeTime value={0} format="tiny" />;
    void [iconOnlyCopyButtonNeedsAName, falseChildrenLeaveCopyButtonIconOnly, nullChildrenLeaveCopyButtonIconOnly, namedWithoutLabel, avatarGroupTakesAvatarSizes, paginationAsksForPages, relativeTimeHasThreeFormats];
  `,
  );
});
