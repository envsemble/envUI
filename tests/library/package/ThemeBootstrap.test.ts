import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import {
  createThemeBootstrapScript,
  defineTheme,
} from '../../../packages/ui/dist/theme-bootstrap.js';
import { createStoredThemeBootstrapScript } from '../../../packages/ui/dist/theme-storage.js';

function bootstrap(
  script,
  { stored = null, storedUnder = 'env-theme', systemDark = false, attributes = {} } = {},
) {
  const root = {
    attributes: { ...attributes },
    classes: new Set(),
    style: {},
    classList: { add: (name) => root.classes.add(name) },
    setAttribute: (name, value) => (root.attributes[name] = String(value)),
  };
  runInNewContext(script, {
    document: { documentElement: root },
    localStorage: { getItem: (key) => (key === storedUnder ? stored : null) },
    matchMedia: (query) => ({ matches: query === '(prefers-color-scheme: dark)' && systemDark }),
  });
  return root;
}

test('the bootstrap script themes the root with the preference given or the system theme, and reads no storage', () => {
  const root = bootstrap(createThemeBootstrapScript({}, { preference: 'dark' }), {
    stored: 'light',
  });
  assert.ok(root.classes.has('env-theme'));
  assert.equal(root.attributes['data-env-theme'], 'dark');
  assert.equal(root.style.colorScheme, 'dark');
  assert.doesNotMatch(createThemeBootstrapScript(), /localStorage/);
  for (const preference of [undefined, 'system', 'blue'])
    assert.equal(
      bootstrap(createThemeBootstrapScript({}, { preference }), { systemDark: true }).attributes[
        'data-env-theme'
      ],
      'dark',
      preference,
    );
});

test('the stored bootstrap script themes the root with the stored preference, or else the default', () => {
  const storage = { storageKey: 'app-theme', defaultPreference: 'dark' };
  const script = createStoredThemeBootstrapScript({ corners: 'sharp' }, storage);
  const stored = bootstrap(script, { stored: 'light', storedUnder: 'app-theme' });
  assert.equal(stored.attributes['data-env-theme'], 'light');
  assert.equal(stored.attributes['data-env-corners'], 'sharp');
  for (const value of [null, 'blue'])
    assert.equal(
      bootstrap(script, { stored: value, storedUnder: 'app-theme' }).attributes['data-env-theme'],
      'dark',
    );
  assert.equal(
    bootstrap(createStoredThemeBootstrapScript(), { stored: 'dark' }).attributes['data-env-theme'],
    'dark',
  );
});

test("the bootstrap script writes a high or standard contrast before the first paint, marked as envUI's", () => {
  for (const contrast of ['high', 'standard']) {
    const root = bootstrap(createThemeBootstrapScript({ contrast }));
    assert.equal(root.attributes['data-env-contrast'], contrast, contrast);
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

test('one theme definition gives the root its selection and corners before the first paint', () => {
  const theme = defineTheme({ selection: 'accent', corners: 'sharp' });
  assert.ok(Object.isFrozen(theme));
  const root = bootstrap(createThemeBootstrapScript(theme, { preference: 'dark' }));
  assert.equal(root.attributes['data-env-theme'], 'dark');
  assert.equal(root.attributes['data-env-surface'], undefined);
  assert.equal(root.attributes['data-env-selection'], 'accent');
  assert.equal(root.attributes['data-env-corners'], 'sharp');
  const plain = createThemeBootstrapScript({ selection: 'teal' as never, corners: undefined });
  assert.doesNotMatch(plain, /data-env-selection|data-env-corners/);
});
