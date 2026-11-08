// Run by tests/library/ClientDirectives.test.mjs with `--conditions=react-server` and ClientReferences.mjs:
// imports every entry point of the built package as a server component's module graph would, and
// renders envUI on the server. Prints what it found as JSON.
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import * as ui from '@envsemble/envui';
import * as content from '@envsemble/envui/content';
import * as diff from '@envsemble/envui/diff';
import * as color from '@envsemble/envui/color';
import * as richText from '@envsemble/envui/rich-text';
import * as themeBootstrap from '@envsemble/envui/theme-bootstrap';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { render } from './Render.mjs';

const clientReference = Symbol.for('react.client.reference');
const isClientReference = (value) => value?.$$typeof === clientReference;
/** forwardRef and memo give objects rather than functions; they are components all the same. */
const wrappedComponents = new Set([Symbol.for('react.forward_ref'), Symbol.for('react.memo')]);
const isComponent = (name, value) =>
  /^[A-Z]/.test(name.split('.').at(-1)) &&
  (typeof value === 'function' || wrappedComponents.has(value?.$$typeof));

/** The documented props of each component, which choose the props each one is rendered with. */
const documented = JSON.parse(
  readFileSync(new URL('../../docs/generated/props.json', import.meta.url), 'utf8'),
).exports;

/** Props that a component needs to render at all, beyond the shared ones below. */
const requiredProps = {
  AvatarGroup: { people: [{ name: 'Alex Morgan' }, { name: 'Sam Lee' }] },
  DiffStat: { additions: 12, deletions: 3 },
};

const icon = h(IconHome);

/**
 * The props a component is rendered with beyond its defaults, from its documented props: each
 * boolean on, each value of a union of literals, an icon in each icon slot, and a destination,
 * also disabled or pending, and icon-only, where it takes them.
 */
function variantsOf(name) {
  const props = documented[name]?.props ?? [];
  const takes = (prop) => props.some((candidate) => candidate.name === prop);
  const variants = [];
  for (const { name: prop, type } of props) {
    if (/^on[A-Z]/.test(prop) || prop === 'children') continue;
    if (type === 'boolean') variants.push({ [prop]: true });
    else if (/^'[^']*'(?:\s*\|\s*'[^']*')*$/.test(type))
      for (const [, value] of type.matchAll(/'([^']*)'/g)) variants.push({ [prop]: value });
    else if (/Icon$/.test(prop) && /ReactNode/.test(type)) variants.push({ [prop]: icon });
  }
  if (takes('href')) {
    variants.push({ href: '/destination' });
    for (const prop of ['disabled', 'pending'])
      if (takes(prop)) variants.push({ href: '/destination', [prop]: true });
  }
  if (takes('iconOnly'))
    variants.push({ iconOnly: true, icon, 'aria-label': 'Home', children: undefined });
  return variants;
}

/** A variant's props as a reader writes them: `pending`, `href="/destination"`, `icon={…}`. */
const describe = (variant) =>
  Object.entries(variant)
    .filter(([, value]) => value !== undefined)
    .map(([prop, value]) =>
      value === true ? prop : typeof value === 'string' ? `${prop}="${value}"` : `${prop}={…}`,
    )
    .join(' ');

/**
 * Every export of an entry: client references, server components (each rendered on the server,
 * with its defaults and with each variant of its props, which `variants` lists by component), and
 * plain values, with the server components that failed to render, with which props and why.
 */
function survey(entry, exports) {
  const found = { client: [], server: [], values: [], failed: [], renders: 0, variants: {} };
  const visit = (name, value) => {
    if (isClientReference(value)) found.client.push(name);
    else if (isComponent(name, value)) {
      const base = { children: 'Text', label: 'Label', title: 'Title', value: 1 };
      let rendered = true;
      for (const variant of [{}, ...variantsOf(name)]) {
        try {
          render(h(value, { ...base, ...requiredProps[name], ...variant }));
          found.renders += 1;
          (found.variants[name] ??= []).push(describe(variant) || '(defaults)');
        } catch (error) {
          rendered = false;
          const props = describe(variant);
          found.failed.push(`${entry} ${name}${props ? ` with ${props}` : ''}: ${error.message}`);
        }
      }
      if (rendered) found.server.push(name);
    } else if (value && typeof value === 'object' && !Array.isArray(value))
      for (const [key, item] of Object.entries(value)) visit(`${name}.${key}`, item);
    else found.values.push(name);
  };
  for (const [name, value] of Object.entries(exports)) visit(name, value);
  return found;
}

/** A plain function's result on the server, or the error it threw. */
function attempt(run) {
  try {
    return { result: run() };
  } catch (error) {
    return { error: error.message };
  }
}

const page = render(
  h(
    ui.Card,
    { title: 'Release' },
    h(ui.Text, null, 'Ready to ship'),
    h(ui.Badge, null, 'New'),
    h(ui.Button, { startIcon: h(IconHome), href: '/home' }, 'Home'),
    h(ui.Button, { pending: true }, 'Publish'),
    h(ui.Button, { href: '/archive', pending: true }, 'Archive'),
    h(ui.Button, { href: '/history', disabled: true }, 'History'),
    h(ui.IconButton, { icon: h(IconSearch), 'aria-label': 'Search' }),
    h(ui.IconButton, { icon: h(IconSearch), 'aria-label': 'Searching', pending: true }),
    h(ui.Menu.Root, { trigger: h(ui.Button, null, 'More') }, h(ui.Menu.Item, null, 'Rename')),
    h(ui.Alert, { tone: 'success', title: 'Saved' }, 'The release is saved.'),
  ),
);

// A list that isn't reorderable is markup alone: its current rows are marked on the server.
const list = render(
  h(
    ui.List.Root,
    { 'aria-label': 'Plans' },
    h(ui.List.Item, {
      interactive: true,
      current: true,
      label: h('a', { href: '/plans/launch', 'data-row-target': true }, 'Launch'),
    }),
    h(ui.List.Item, { label: 'Roadmap', current: true }),
    h(ui.List.Item, { label: 'Budget', start: h('span', null, 'B') }),
  ),
);

console.log(
  JSON.stringify({
    list,
    menuItem: isClientReference(ui.Menu.Item),
    themeBootstrapScript: typeof ui.createThemeBootstrapScript({ storageKey: 'app-theme' }),
    bootstrapEntryScript: typeof themeBootstrap.createThemeBootstrapScript(),
    bootstrapContrastScript: themeBootstrap.createThemeBootstrapScript({ contrast: 'high' }),
    relativeTime: ui.formatRelativeTime(Date.UTC(2026, 9, 14, 9), {
      now: Date.UTC(2026, 9, 14, 12),
      locale: 'en',
    }),
    diffLines: attempt(() => diff.countDiffLines('a\nb\nc\n', 'a\nB\nc\nd\n', 'notes.txt')),
    richTextExtensions: attempt(() =>
      richText.createRichTextExtensions().map((extension) => extension.name),
    ),
    surveys: {
      '@envsemble/envui': survey('@envsemble/envui', ui),
      '@envsemble/envui/content': survey('@envsemble/envui/content', content),
      '@envsemble/envui/diff': survey('@envsemble/envui/diff', diff),
      '@envsemble/envui/color': survey('@envsemble/envui/color', color),
      '@envsemble/envui/rich-text': survey('@envsemble/envui/rich-text', richText),
    },
    page,
  }),
);
