// The theme bootstrap script themes the document root before the first paint. These tests run the
// built script against a stand-in root, as a browser would run it from the document head.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { createThemeBootstrapScript } from '../../../packages/ui/dist/theme-bootstrap.js';

/** Runs a bootstrap script and returns the root it themed. */
function bootstrap(script, { stored = null, systemDark = false, attributes = {} } = {}) {
  const root = {
    attributes: { ...attributes },
    classes: new Set(),
    style: {},
    classList: { add: (name) => root.classes.add(name) },
    setAttribute: (name, value) => (root.attributes[name] = String(value)),
  };
  runInNewContext(script, {
    document: { documentElement: root },
    localStorage: { getItem: () => stored },
    matchMedia: (query) => ({ matches: query === '(prefers-color-scheme: dark)' && systemDark }),
  });
  return root;
}

test('the bootstrap script themes the root with the stored or system theme', () => {
  const root = bootstrap(createThemeBootstrapScript({ storageKey: 'app-theme' }), {
    stored: 'dark',
  });
  assert.ok(root.classes.has('env-theme'));
  assert.equal(root.attributes['data-env-theme'], 'dark');
  assert.equal(root.style.colorScheme, 'dark');
  assert.equal(
    bootstrap(createThemeBootstrapScript(), { systemDark: true }).attributes['data-env-theme'],
    'dark',
  );
});

test('the bootstrap script writes a high or standard contrast before the first paint', () => {
  for (const contrast of ['high', 'standard']) {
    const root = bootstrap(createThemeBootstrapScript({ contrast }));
    assert.equal(root.attributes['data-env-contrast'], contrast, contrast);
    // Marked as envUI's, with the value written, so ThemePreferenceProvider replaces or removes it
    // as its own while the page leaves it unchanged.
    assert.equal(root.attributes['data-env-contrast-source'], `envui:${contrast}`, contrast);
  }
});

test('with a system contrast, the bootstrap script leaves the root contrast alone', () => {
  for (const options of [{}, { contrast: 'system' }]) {
    const script = createThemeBootstrapScript(options);
    assert.doesNotMatch(script, /data-env-contrast/);
    const root = bootstrap(script, { attributes: { 'data-env-contrast': 'standard' } });
    assert.equal(root.attributes['data-env-contrast'], 'standard');
    assert.equal(root.attributes['data-env-contrast-source'], undefined);
  }
});

test('an unknown contrast writes nothing, as system does', () => {
  assert.doesNotMatch(createThemeBootstrapScript({ contrast: 'more' }), /data-env-contrast/);
});

test('the bootstrap script writes a compact or comfortable scale before the first paint, and nothing for system', () => {
  for (const scale of ['compact', 'comfortable']) {
    const root = bootstrap(createThemeBootstrapScript({ scale }));
    assert.equal(root.attributes['data-env-scale'], scale);
    assert.equal(root.attributes['data-env-scale-source'], `envui:${scale}`);
  }
  for (const options of [{}, { scale: 'system' }])
    assert.doesNotMatch(createThemeBootstrapScript(options), /data-env-scale/);
});
