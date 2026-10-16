// Run by tests/ClientDirectives.test.mjs with `--conditions=react-server` and ClientReferences.mjs:
// imports every entry point of the built package as a server component's module graph would, and
// renders envUI on the server. Prints what it found as JSON.
import { createElement as h } from 'react';
import * as ui from '@envsemble/envui';
import * as content from '@envsemble/envui/content';
import * as diff from '@envsemble/envui/diff';
import * as richText from '@envsemble/envui/rich-text';
import * as themeBootstrap from '@envsemble/envui/theme-bootstrap';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons';
import { render } from './Render.mjs';

const clientReference = Symbol.for('react.client.reference');
const isClientReference = (value) => value?.$$typeof === clientReference;

/** Props that a component needs to render at all, beyond the shared ones below. */
const requiredProps = {
  AvatarGroup: { people: [{ name: 'Alex Morgan' }, { name: 'Sam Lee' }] },
  DiffStat: { additions: 12, deletions: 3 },
};

/**
 * Every export of an entry: client references, server components (each rendered on the server),
 * and plain values, with the server components that failed to render and why.
 */
function survey(entry, exports) {
  const found = { client: [], server: [], values: [], failed: [] };
  const visit = (name, value) => {
    if (isClientReference(value)) found.client.push(name);
    else if (typeof value === 'function' && /^[A-Z]/.test(name.split('.').at(-1))) {
      try {
        const props = { children: 'Text', label: 'Label', title: 'Title', value: 1 };
        render(h(value, { ...props, ...requiredProps[name] }));
        found.server.push(name);
      } catch (error) {
        found.failed.push(`${entry} ${name}: ${error.message}`);
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value))
      for (const [key, item] of Object.entries(value)) visit(`${name}.${key}`, item);
    else found.values.push(name);
  };
  for (const [name, value] of Object.entries(exports)) visit(name, value);
  return found;
}

const page = render(
  h(
    ui.Card,
    { title: 'Release' },
    h(ui.Text, null, 'Ready to ship'),
    h(ui.Badge, null, 'New'),
    h(ui.Button, { startIcon: h(Home), href: '/home' }, 'Home'),
    h(ui.IconButton, { icon: h(Search), 'aria-label': 'Search' }),
    h(ui.Menu.Root, { trigger: h(ui.Button, null, 'More') }, h(ui.Menu.Item, null, 'Rename')),
    h(ui.Alert, { tone: 'success', title: 'Saved' }, 'The release is saved.'),
    h(ui.Stat.Root, { label: 'Builds', value: 12 }),
  ),
);

console.log(
  JSON.stringify({
    menuItem: isClientReference(ui.Menu.Item),
    themeBootstrapScript: typeof ui.createThemeBootstrapScript({ storageKey: 'app-theme' }),
    bootstrapEntryScript: typeof themeBootstrap.createThemeBootstrapScript(),
    bootstrapContrastScript: themeBootstrap.createThemeBootstrapScript({ contrast: 'high' }),
    relativeTime: ui.formatRelativeTime(Date.UTC(2026, 9, 14, 9), {
      now: Date.UTC(2026, 9, 14, 12),
      locale: 'en',
    }),
    surveys: {
      '@envsemble/envui': survey('@envsemble/envui', ui),
      '@envsemble/envui/content': survey('@envsemble/envui/content', content),
      '@envsemble/envui/diff': survey('@envsemble/envui/diff', diff),
      '@envsemble/envui/rich-text': survey('@envsemble/envui/rich-text', richText),
    },
    page,
  }),
);
