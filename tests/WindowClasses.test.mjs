// The window classes: the constant holds the window-class tokens' widths, the theme boundary is the
// env-window container, and the style sheets respond to containers at those widths. Width media
// queries are left only in the frame's style sheets, which a later change removes with the frame.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repository = fileURLToPath(new URL('../', import.meta.url));
const styles = join(repository, 'packages/ui/src/styles');
const output = join(repository, '.cache/unit/WindowClasses.mjs');
await build({
  absWorkingDir: repository,
  entryPoints: ['packages/ui/src/foundations/windowClasses.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: output,
  logLevel: 'error',
});
const { windowClasses } = await import(pathToFileURL(output).href);

/** The style sheets envUI ships, by file name, without the generated tokens. */
const sheets = Object.fromEntries(
  readdirSync(styles)
    .filter((file) => file.endsWith('.css') && file !== 'Tokens.css')
    .map((file) => [file, readFileSync(join(styles, file), 'utf8')]),
);

/** The style sheets whose width media queries go with the app frame they belong to. */
const frameSheets = ['AppShell.css', 'AppShellBase.css', 'Sidebar.css', 'Drawer.css'];

/**
 * Container thresholds that are a component's own rather than a window class, each with why: a
 * window class would not fit them.
 */
const ownThresholds = {
  // A label beside its value needs about 24 rem, whatever the window.
  'DescriptionList.css': ['24rem'],
  // SplitPane and ListDetail stack at their stackBelow, 44 rem by default; Panes replaces them.
  'SplitPane.css': ['44rem'],
  'ListDetail.css': ['44rem'],
};

test('windowClasses holds the widths of the window-class tokens, from compact up', () => {
  assert.deepEqual(windowClasses, {
    compact: '0rem',
    medium: '37.5rem',
    expanded: '52.5rem',
    large: '75rem',
  });
  const { tokens } = JSON.parse(
    readFileSync(join(repository, 'packages/ui/src/generated/tokens.json'), 'utf8'),
  );
  const fromTokens = Object.fromEntries(
    tokens
      .filter((token) => token.id.startsWith('window-class.'))
      .map((token) => [token.id.slice('window-class.'.length), token.values.light.css]),
  );
  const { compact, ...starts } = windowClasses;
  assert.equal(compact, '0rem');
  assert.deepEqual(fromTokens, starts);
  assert.ok(!tokens.some((token) => token.id.startsWith('breakpoint.')), 'no breakpoint tokens');
});

test('the outermost theme boundary is the env-window container, and takes its width', () => {
  assert.match(
    sheets['Theme.css'],
    /:where\(\.env-theme\):not\(:where\(\.env-theme \.env-theme\)\) \{\s*container: env-window \/ inline-size;\s*inline-size: 100%;/,
    'Theme.css makes the outermost .env-theme the env-window container, as wide as its context',
  );
  // An outermost popup boundary is a box out of flow, which a grid or flex body gives no cell; an
  // overlay's is a layer fixed over the viewport, and a toast's is no container.
  assert.match(
    sheets['Popup.css'],
    /\.env-popup-theme:not\(\.env-theme \.env-popup-theme\) \{\s*display: block;\s*position: absolute;/,
  );
  assert.match(sheets['Dialog.css'], /\.env-overlay-theme \{\s*position: fixed;\s*inset: 0;/);
  assert.match(sheets['Toast.css'], /\.env-toast-portal-theme \{\s*container-type: normal;/);
});

test('no style sheet queries the viewport width outside the frame', () => {
  const widthMedia = /@media[^{]*\b(?:min-|max-)?width\b/;
  const found = Object.entries(sheets)
    .filter(([file, css]) => !frameSheets.includes(file) && widthMedia.test(css))
    .map(([file]) => file);
  assert.deepEqual(found, []);
});

test('container queries use the window classes, or a threshold a component owns', () => {
  const widths = new Set(Object.values(windowClasses).filter((width) => width !== '0rem'));
  const found = [];
  for (const [file, css] of Object.entries(sheets))
    for (const [, condition] of css.matchAll(/@container\b([^{]*)\{/g))
      for (const [length] of condition.matchAll(/\d+(?:\.\d+)?(?:rem|px|em)\b/g))
        if (!widths.has(length) && !ownThresholds[file]?.includes(length))
          found.push(`${file}: ${condition.trim()}`);
  assert.deepEqual(found, []);
  // Compact is the default and a query switches up, so a missing env-window means compact.
  for (const css of Object.values(sheets))
    for (const [, condition] of css.matchAll(/@container\s+env-window\b([^{]*)\{/g))
      assert.match(condition, /^\s*\(width >= (?:37\.5|52\.5|75)rem\)\s*$/, condition);
});
