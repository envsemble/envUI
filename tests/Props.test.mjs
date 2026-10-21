import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { extractProps, propsFile, serializeProps } from '../scripts/ExtractProps.mjs';

const extracted = extractProps();
const { exports } = extracted;
const props = (name) => Object.fromEntries(exports[name].props.map((prop) => [prop.name, prop]));

test('docs/generated/props.json matches the TypeScript source', () => {
  assert.equal(
    readFileSync(propsFile, 'utf8'),
    serializeProps(extracted),
    'Run `npm run docs:props` and commit docs/generated/props.json.',
  );
});

test('props carry readable types, defaults from destructuring and their TSDoc', () => {
  const button = props('Button');
  assert.match(button.variant.type, /^'primary' \| /, 'own literal aliases are spelled out');
  assert.equal(button.variant.default, "'primary'");
  assert.equal(button.pending.type, 'boolean');
  assert.match(button.pending.description, /spinner/);
  assert.equal(props('Dialog').title.required, true);
  assert.match(props('Dialog').closeLabel.default, /^'Close'/);
});

test('a default that names a private value shows the value, or nothing', () => {
  const publicNames = new Set(Object.keys(exports));
  // A private const reads as what it holds.
  assert.equal(props('ThemePreferenceProvider').storageKey.default, "'env-theme'");
  // A TSDoc @default says it in words instead, as for a label function the messages now hold.
  assert.equal(props('AvatarGroup').formatMore.default, "'{count} more'");
  assert.equal(
    props('DocumentTabs').closeLabel.default,
    "'Close {label}', or EnvUIProvider's messages.documentTabs.close",
  );
  assert.equal(props('Rating').formatLabel.default, "'{value} out of {max} stars'");
  // A private list reads as the list it holds.
  assert.equal(
    props('MarkdownEditor').toolbar.default,
    "['heading', 'bold', 'italic', 'bullet-list', 'numbered-list', 'quote', 'inline-code', 'code-block', 'link']",
  );
  // A default that follows the locale says so in words too.
  assert.equal(
    props('CalendarHeatmap').formatValue.default,
    "the number format of EnvUIProvider's locale, or else the browser's",
  );
  // No default names something a reader cannot import, other than another of its props, such as
  // Slider's defaultValue, which starts at min.
  for (const [name, entry] of Object.entries(exports))
    for (const prop of entry.props ?? [])
      if (
        /^[A-Za-z_$][\w$]*$/.test(prop.default ?? '') &&
        !['true', 'false', 'null', 'undefined'].includes(prop.default) &&
        !entry.props.some((other) => other.name === prop.default)
      )
        assert.ok(
          publicNames.has(prop.default),
          `${name}.${prop.name} defaults to ${prop.default}`,
        );
});

test('native DOM props are summarised by element instead of listed', () => {
  assert.deepEqual(exports.Button.native, ['button', 'a']);
  assert.deepEqual(exports.TextField.native, ['input']);
  assert.deepEqual(exports['Table.Root'].native, ['table']);
  assert.equal(props('Button').onClick, undefined);
  assert.equal(props('TextField').placeholder, undefined);
});

test('a prop required in only some forms names what selects them', () => {
  const button = props('Button');
  assert.equal(button.iconOnly, undefined, 'IconButton is the one icon-only button');
  assert.equal(button.href.requiredWhen, undefined);
  assert.equal(props('IconButton').href.requiredWhen, undefined);
  assert.equal(props('ConfirmButton')['aria-label'].requiredWhen, '`icon` is set');
  assert.equal(props('CopyButton')['aria-label'].requiredWhen, '`children` is not set');
});

test('namespaces list their parts, which are documented like components', () => {
  assert.equal(exports.Menu.kind, 'namespace');
  assert.ok(exports.Menu.parts.includes('Menu.Item'));
  assert.equal(exports['Menu.Item'].kind, 'component');
  assert.equal(props('Menu.Item').children.required, true);
  assert.equal(exports.useToast.kind, 'function');
  assert.deepEqual(exports.createThemeBootstrapScript.entries, [
    '@envsemble/envui',
    '@envsemble/envui/theme-bootstrap',
  ]);
});
