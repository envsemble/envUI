// What NavigationBar, NavigationRail and NavigationDrawer share over the same destinations: the
// landmark and its name, the current destination, counts and links. Server markup.
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
      // A Material Symbol inside the application's own wrapper fills too.
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
      // Each icon is drawn once: a filled symbol replaces the outlined one.
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
    // Its text is the label, then the count, apart, in the order its name gives them.
    assert.equal(textOf(inbox), 'Inbox 3');
    const sent = item(nav, 'Sent');
    assert.equal(sent.attributes['aria-label'], 'Sent, 999+ new');
    assert.deepEqual(count(sent).map(textOf), ['999+']);
    // A count of 0 shows nothing, and the label alone names the destination.
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
    // Outside a LinkProvider, a destination is a native anchor.
    const plain = item(render(h(Navigation, { destinations: linked })), 'Inbox');
    assert.equal(plain.tag, 'a');
    assert.equal(plain.attributes['data-router-link'], undefined);
  }
});
