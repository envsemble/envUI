import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';

const { Badge, NavigationDrawer, NavigationRail } = await importSource(
  'NavigationDrawer',
  'packages/ui/src/index.ts',
);

const render = (component, props) => firstElement(renderToStaticMarkup(h(component, props)));
const all = (root, test) => elementsOf(root).filter(test);
const byClass = (root, name) => all(root, (element) => hasClass(element, name));
const icon = h('svg');

test("a Drawer destination's badge follows its label, and names it with the label", () => {
  const nav = render(NavigationDrawer, {
    'aria-label': 'Badged drawer',
    destinations: [
      { label: 'Reports', href: '#reports', badge: h(Badge, { tone: 'success' }, 'New') },
      { label: 'Archive', href: '#archive', count: 2, badge: h(Badge, null, 'Beta') },
    ],
  });
  const [reports, archive] = all(nav, (element) => element.tag === 'a');
  assert.equal(reports.attributes['aria-label'], undefined);
  assert.equal(textOf(reports), 'ReportsNew');
  assert.deepEqual(
    reports.children.map((part) => part.attributes.class),
    ['env-navigation-drawer-label', 'env-navigation-drawer-badge'],
  );
  assert.equal(archive.attributes['aria-label'], 'Archive, 2 new');
  assert.equal(textOf(archive), 'ArchiveBeta 2');
});

const mail = [
  { label: 'Inbox', count: 3 },
  { label: 'Drafts', count: 0 },
  { label: 'Sent', count: 1200 },
  { label: 'Starred', group: 'Folders' },
  { label: 'Archive', group: 'Folders' },
  { label: 'Settings', group: 'Account' },
].map((destination) => ({ ...destination, icon, onClick: () => undefined }));

test('Drawer heads each run of a group with a level-2 heading naming its list, between its header and footer, and Rail keeps the order without headings', () => {
  const drawer = render(NavigationDrawer, {
    'aria-label': 'Mail drawer',
    destinations: mail,
    header: h('button', null, 'Compose'),
    footer: h('span', null, 'Footer'),
  });
  const headings = byClass(drawer, 'env-navigation-drawer-group-label');
  assert.deepEqual(headings.map(textOf), ['Folders', 'Account']);
  assert.ok(headings.every((heading) => heading.tag === 'h2'));
  const lists = headings.map(
    (heading) =>
      all(drawer, (element) => element.attributes['aria-labelledby'] === heading.attributes.id)[0],
  );
  assert.deepEqual(
    lists.map((list) => all(list, (element) => element.tag === 'button').map(textOf)),
    [['Starred', 'Archive'], ['Settings']],
  );
  const order = ['Inbox', 'Drafts', 'Sent', 'Starred', 'Archive', 'Settings'];
  assert.deepEqual(byClass(drawer, 'env-navigation-drawer-label').map(textOf), order);
  assert.deepEqual(
    drawer.children.map((part) => part.attributes.class),
    ['env-navigation-drawer-header', 'env-navigation-drawer-list', 'env-navigation-drawer-footer'],
  );
  const rail = render(NavigationRail, { 'aria-label': 'Mail rail', destinations: mail });
  assert.deepEqual(byClass(rail, 'env-navigation-rail-label').map(textOf), order);
  assert.equal(all(rail, (element) => /^h\d$/.test(element.tag)).length, 0);
  assert.equal(all(rail, (element) => /heading/.test(element.attributes.class ?? '')).length, 0);
});

test('a width that is no number is ignored, and the drawer keeps its default', () => {
  const drawer = render(NavigationDrawer, {
    'aria-label': 'Not a number',
    resizable: true,
    width: Number.NaN,
    destinations: [{ label: 'Inbox', href: '#inbox', current: true }],
  });
  assert.match(drawer.attributes.style, /--env-navigation-drawer-width:17\.5rem/);
  const [handle] = all(drawer, (element) => element.attributes.role === 'separator');
  assert.equal(handle.attributes['aria-valuenow'], '17.5');
  assert.equal(handle.attributes['aria-valuetext'], '17.5 rem');
});

const guidePagesTwoLevelsDeep = [
  { label: 'Overview', href: '#overview', group: 'Getting started' },
  {
    label: 'Sign-in',
    href: '#sign-in',
    group: 'Getting started',
    children: [
      { label: 'Passwords', href: '#passwords' },
      { label: 'Passkeys', href: '#passkeys', current: true },
    ],
  },
  {
    label: 'Billing',
    group: 'Account',
    children: [
      { label: 'Plans', href: '#plans' },
      { label: 'Invoices', href: '#invoices' },
    ],
  },
];

test('the current page’s sections start open, the rest closed with their links in the page, and only the current page reports aria-current', () => {
  const drawer = render(NavigationDrawer, {
    'aria-label': 'Guide',
    destinations: guidePagesTwoLevelsDeep,
  });
  const link = (href) => all(drawer, (element) => element.attributes.href === href)[0];
  const button = (name) =>
    all(
      drawer,
      (element) =>
        element.tag === 'button' && (element.attributes['aria-label'] ?? textOf(element)) === name,
    )[0];
  assert.equal(textOf(link('#sign-in')), 'Sign-in');
  const signIn = button('Sign-in contents');
  assert.equal(signIn.attributes['aria-expanded'], 'true');
  const contents = all(
    drawer,
    (element) => element.attributes.id === signIn.attributes['aria-controls'],
  )[0];
  assert.ok(elementsOf(contents).includes(link('#passkeys')));
  assert.equal(contents.attributes.hidden, undefined);
  assert.equal(link('#passkeys').attributes['aria-current'], 'page');
  const billing = button('Billing');
  assert.equal(billing.attributes['aria-expanded'], 'false');
  const branch = all(drawer, (element) => element.children.includes(billing))[0];
  const closed = byClass(branch, 'env-navigation-drawer-children')[0];
  assert.equal(closed.tag, 'ul');
  assert.ok('hidden' in closed.attributes);
  assert.ok(elementsOf(closed).includes(link('#invoices')));
  assert.equal(all(drawer, (element) => 'aria-current' in element.attributes).length, 1);
});

test('Drawer puts groupEnd after a group’s heading, outside it, and leaves a heading without one alone', () => {
  const drawer = render(NavigationDrawer, {
    destinations: [
      { label: 'Atlas', group: 'Projects', icon, onClick() {} },
      { label: 'Profile', group: 'Account', icon, onClick() {} },
    ],
    groupEnd: (group) => (group === 'Projects' ? h('button', null, 'New project') : null),
  });
  const [row] = byClass(drawer, 'env-navigation-drawer-group-row');
  const [heading, end] = row.children;
  assert.ok(hasClass(heading, 'env-navigation-drawer-group-label'));
  assert.equal(textOf(heading), 'Projects');
  assert.ok(hasClass(end, 'env-navigation-drawer-group-end'));
  assert.equal(textOf(end), 'New project');
  assert.equal(byClass(drawer, 'env-navigation-drawer-group-row').length, 1);
  assert.equal(byClass(drawer, 'env-navigation-drawer-group-label').length, 2);
});
