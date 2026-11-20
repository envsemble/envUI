import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const {
  NavigationBar,
  NavigationDrawer,
  NavigationRail,
  LinkProvider,
  IconDrafts,
  IconHome,
  IconInbox,
  IconSend,
  IconSettings,
} = await importSource('Destinations', [
  "export * from './packages/ui/src/navigation/NavigationBar.tsx';",
  "export * from './packages/ui/src/navigation/NavigationDrawer.tsx';",
  "export * from './packages/ui/src/navigation/NavigationRail.tsx';",
  "export * from './packages/ui/src/foundations/LinkProvider.tsx';",
  "export { IconDrafts } from './packages/ui/src/icons/Drafts.tsx';",
  "export { IconHome } from './packages/ui/src/icons/Home.tsx';",
  "export { IconInbox } from './packages/ui/src/icons/Inbox.tsx';",
  "export { IconSend } from './packages/ui/src/icons/Send.tsx';",
  "export { IconSettings } from './packages/ui/src/icons/Settings.tsx';",
]);

const forms = { drawer: NavigationDrawer, rail: NavigationRail, bar: NavigationBar };
const render = (element) => firstElement(renderToString(element));
const all = (root, matches) => elementsOf(root).filter(matches);
const items = (nav) => all(nav, (element) => element.tag === 'button' || element.tag === 'a');
const item = (nav, label) =>
  items(nav).find((element) =>
    (element.attributes['aria-label'] ?? textOf(element)).startsWith(label),
  );
const iconPaths = (element) =>
  all(element, (each) => each.tag === 'path').map((path) => path.attributes.d);

const mail = [
  { label: 'Inbox', icon: h(IconInbox), count: 3, onClick() {} },
  { label: 'Drafts', icon: h(IconDrafts), count: 0, onClick() {} },
  { label: 'Sent', icon: h(IconSend), count: 1200, onClick() {} },
];

test('each form is a navigation landmark, named by its label, its heading or Main', () => {
  for (const [form, Navigation] of Object.entries(forms)) {
    const labelled = render(h(Navigation, { 'aria-label': `Mail ${form}`, destinations: mail }));
    assert.equal(labelled.tag, 'nav');
    assert.ok(hasClass(labelled, `env-navigation-${form}`));
    assert.equal(labelled.attributes['aria-label'], `Mail ${form}`);
    const headed = render(h(Navigation, { 'aria-labelledby': 'routed', destinations: mail }));
    assert.equal(headed.attributes['aria-labelledby'], 'routed');
    assert.equal(headed.attributes['aria-label'], undefined);
    assert.equal(render(h(Navigation, { destinations: mail })).attributes['aria-label'], 'Main');
  }
});

test('the current destination reports aria-current and fills its icon, also wrapped', () => {
  const destinations = (current) => [
    { label: 'Home', icon: h(IconHome), current: current === 'Home', onClick() {} },
    {
      label: 'Settings',
      icon: h('span', null, h(IconSettings)),
      current: current === 'Settings',
      onClick() {},
    },
  ];
  for (const Navigation of Object.values(forms)) {
    const before = render(h(Navigation, { destinations: destinations('Home') }));
    const after = render(h(Navigation, { destinations: destinations('Settings') }));
    for (const [nav, current, other] of [
      [before, 'Home', 'Settings'],
      [after, 'Settings', 'Home'],
    ]) {
      assert.equal(item(nav, current).attributes['aria-current'], 'page');
      assert.equal(item(nav, current).attributes['data-current'], '');
      assert.equal(item(nav, other).attributes['aria-current'], undefined);
      assert.equal(all(nav, (element) => 'aria-current' in element.attributes).length, 1);
    }
    for (const label of ['Home', 'Settings']) {
      assert.equal(iconPaths(item(before, label)).length, 1);
      assert.notDeepEqual(iconPaths(item(before, label)), iconPaths(item(after, label)));
    }
  }
});

test('a count shows on its destination, capped at 999+, and its name says it', () => {
  for (const form of ['drawer', 'rail', 'bar']) {
    const nav = render(h(forms[form], { destinations: mail }));
    const count = (element) =>
      all(element, (each) => hasClass(each, `env-navigation-${form}-count`));
    const inbox = item(nav, 'Inbox');
    assert.equal(inbox.attributes['aria-label'], 'Inbox, 3 new');
    assert.deepEqual(count(inbox).map(textOf), ['3']);
    assert.equal(count(inbox)[0].attributes['aria-hidden'], 'true');
    assert.equal(textOf(inbox), 'Inbox 3');
    const sent = item(nav, 'Sent');
    assert.equal(sent.attributes['aria-label'], 'Sent, 999+ new');
    assert.deepEqual(count(sent).map(textOf), ['999+']);
    const drafts = item(nav, 'Drafts');
    assert.equal(drafts.attributes['aria-label'], undefined);
    assert.equal(textOf(drafts), 'Drafts');
    assert.equal(count(drafts).length, 0);
  }
});

test('a destination with href is a link through the LinkProvider', () => {
  const linked = [
    { label: 'Home', icon: h(IconHome), href: '#home', current: true },
    { label: 'Inbox', icon: h(IconInbox), href: '#inbox' },
  ];
  const RouterLink = (props) => h('a', { ...props, 'data-router-link': '' });
  for (const Navigation of Object.values(forms)) {
    const routed = render(
      h(LinkProvider, { component: RouterLink }, h(Navigation, { destinations: linked })),
    );
    const home = item(routed, 'Home');
    assert.equal(home.tag, 'a');
    assert.equal(home.attributes.href, '#home');
    assert.equal(home.attributes['data-router-link'], '');
    assert.equal(home.attributes['aria-current'], 'page');
    const plain = item(render(h(Navigation, { destinations: linked })), 'Inbox');
    assert.equal(plain.tag, 'a');
    assert.equal(plain.attributes['data-router-link'], undefined);
  }
});

test('a destination takes its own item props and can be disabled, keeping its name and aria-current', () => {
  const destinations = [
    {
      label: 'Docs',
      icon: h(IconHome),
      href: '/docs',
      current: true,
      count: 2,
      itemProps: {
        target: '_blank',
        rel: 'noopener',
        title: 'Open the docs',
        className: 'own-item',
        'data-testid': 'docs',
      },
    },
    { label: 'Reports', icon: h(IconInbox), href: '/reports', disabled: true },
    { label: 'Billing', icon: h(IconSettings), onClick() {}, disabled: true },
  ];
  for (const [form, Navigation] of Object.entries(forms)) {
    const nav = render(h(Navigation, { destinations }));
    const docs = item(nav, 'Docs');
    assert.equal(docs.attributes.target, '_blank');
    assert.equal(docs.attributes.rel, 'noopener');
    assert.equal(docs.attributes.title, 'Open the docs');
    assert.equal(docs.attributes['data-testid'], 'docs');
    assert.ok(hasClass(docs, 'own-item') && hasClass(docs, `env-navigation-${form}-item`));
    assert.equal(docs.attributes['aria-current'], 'page');
    assert.equal(docs.attributes['aria-label'], 'Docs, 2 new');
    const reports = item(nav, 'Reports');
    assert.equal(reports.tag, 'a');
    assert.equal(reports.attributes.href, undefined);
    assert.equal(reports.attributes['aria-disabled'], 'true');
    assert.equal(reports.attributes.tabindex, '-1');
    assert.equal(reports.attributes['data-disabled'], '');
    const billing = item(nav, 'Billing');
    assert.equal(billing.tag, 'button');
    assert.equal(billing.attributes.disabled, '');
  }
});

test('a label of any content keeps its text in textValue for the key and the counted name', () => {
  const beta = [
    {
      label: h('span', null, 'Insights ', h('mark', null, 'Beta')),
      textValue: 'Insights',
      icon: h(IconInbox),
      count: 4,
      onClick() {},
    },
  ];
  for (const [form, Navigation] of Object.entries(forms)) {
    const nav = render(h(Navigation, { destinations: beta }));
    const insights = items(nav)[0];
    assert.equal(insights.attributes['aria-label'], 'Insights, 4 new');
    const label = all(insights, (each) => hasClass(each, `env-navigation-${form}-label`))[0];
    assert.equal(all(label, (each) => each.tag === 'mark').length, 1);
  }
});

test('a count of true shows a dot with no number, and the name says the destination has something new', () => {
  const activity = [
    { label: 'Activity', icon: h(IconInbox), count: true, onClick() {} },
    { label: 'Home', icon: h(IconHome), onClick() {} },
  ];
  for (const form of ['drawer', 'rail', 'bar']) {
    const nav = render(h(forms[form], { destinations: activity }));
    const entry = item(nav, 'Activity');
    assert.equal(entry.attributes['aria-label'], 'Activity, new');
    const dots = all(entry, (each) => hasClass(each, `env-navigation-${form}-count`));
    assert.equal(dots.length, 1);
    assert.equal(dots[0].attributes['data-dot'], '');
    assert.equal(textOf(dots[0]), '');
    assert.equal(textOf(entry), 'Activity');
  }
});

test('with visibleLabel false, Rail and Bar mark the landmark and keep each label naming its destination', () => {
  for (const form of ['rail', 'bar']) {
    const nav = render(h(forms[form], { destinations: mail, visibleLabel: false }));
    assert.equal(nav.attributes['data-label-hidden'], '');
    assert.equal(textOf(item(nav, 'Drafts')), 'Drafts');
    const shown = render(h(forms[form], { destinations: mail }));
    assert.equal(shown.attributes['data-label-hidden'], undefined);
  }
});

test('Rail and Bar show the top level, marking the destination whose section holds the current one', () => {
  const icon = h('svg');
  const top = [
    { label: 'Home', icon, href: '#home' },
    {
      label: 'Guide',
      icon,
      href: '#guide',
      children: [{ label: 'Passkeys', href: '#passkeys', current: true }],
    },
    { label: 'Settings', icon, href: '#settings' },
  ];
  for (const component of [NavigationRail, NavigationBar]) {
    const nav = render(h(component, { 'aria-label': 'Top', destinations: top }));
    const links = Object.fromEntries(
      all(nav, (element) => element.tag === 'a').map((element) => [
        element.attributes.href,
        element,
      ]),
    );
    assert.equal(links['#guide'].attributes['aria-current'], 'true');
    assert.equal(links['#guide'].attributes['data-current'], '');
    assert.equal(links['#home'].attributes['aria-current'], undefined);
    assert.equal(links['#passkeys'], undefined);
    assert.doesNotMatch(textOf(nav), /Passkeys/);
  }
});
