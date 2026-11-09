// The window classes: the constant holds the window-class tokens' widths, the theme boundary is the
// env-window container, and the style sheets respond to containers at those widths. Width media
// queries are left nowhere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../support/importSource.mjs';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const styles = join(repositoryRoot, 'packages/ui/src/styles');
const { windowClasses, windowClassOf } = await importSource(
  'WindowClasses',
  'packages/ui/src/foundations/windowClasses.ts',
);

/** The library's hand-written style sheets, by file name. */
const sheets = Object.fromEntries(
  readdirSync(styles)
    .filter((file) => file.endsWith('.css'))
    .map((file) => [file, readFileSync(join(styles, file), 'utf8')]),
);

/**
 * Container thresholds that are a component's own rather than a window class, each with why: a
 * window class would not fit them.
 */
const ownThresholds = {
  // A label beside its value needs about 24 rem, whatever the window.
  'DescriptionList.css': ['18rem'],
  // A stacking Table's region makes 37.5em its stackBelow through its font size, as em in a
  // container query is the container's own.
  'Table.css': ['37.5em'],
  // PanelDock does the same with the dock's own stackBelow.
  'PanelDock.css': ['37.5em'],
  // A calendar seven days of under 2 rem wide names the weekdays by two letters.
  'Calendar.css': ['14rem'],
};

test('windowClasses holds the widths of the window-class tokens, from compact up', () => {
  assert.deepEqual(windowClasses, {
    compact: '0rem',
    medium: '37.5rem',
    expanded: '52.5rem',
    large: '75rem',
  });
  const { tokens } = JSON.parse(
    readFileSync(join(repositoryRoot, 'packages/ui/src/generated/tokens.json'), 'utf8'),
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

test('windowClassOf gives the window class of a width in CSS pixels, at the root font size', () => {
  const kept = { document: globalThis.document, getComputedStyle: globalThis.getComputedStyle };
  let fontSize = '16px';
  globalThis.document = { documentElement: {} };
  globalThis.getComputedStyle = () => ({ fontSize });
  try {
    assert.equal(windowClassOf(0), 'compact');
    assert.equal(windowClassOf(599.5), 'compact');
    assert.equal(windowClassOf(600), 'medium');
    assert.equal(windowClassOf(839), 'medium');
    assert.equal(windowClassOf(840), 'expanded');
    assert.equal(windowClassOf(1200), 'large');
    // Larger text makes the same width a narrower class.
    fontSize = '20px';
    assert.equal(windowClassOf(600), 'compact');
    assert.equal(windowClassOf(750), 'medium');
  } finally {
    Object.assign(globalThis, kept);
  }
});

test('the outermost theme boundary is the env-window container, and takes its width', () => {
  assert.match(
    sheets['Theme.css'],
    /:where\(\.env-theme\):not\(:where\(\.env-theme \.env-theme\)\) \{\s*container: env-window \/ inline-size;\s*display: block;\s*box-sizing: border-box;\s*inline-size: 100%;/,
    'Theme.css makes the outermost .env-theme the env-window container, a block as wide as its context',
  );
  // An outermost popup boundary is a box out of flow, which a grid or flex body gives no cell; an
  // overlay's has no box, its positioner being the container, and a toast's is no container.
  assert.match(
    sheets['Popup.css'],
    /\.env-popup-theme:not\(\.env-theme \.env-popup-theme\) \{\s*display: block;\s*position: absolute;/,
  );
  assert.match(
    sheets['Dialog.css'],
    /\.env-overlay-theme \{\s*display: contents;\s*container-type: normal;/,
  );
  for (const [sheet, layer] of [
    ['Dialog.css', 'env-dialog-positioner'],
    ['CommandPalette.css', 'env-command-palette-positioner'],
    ['Sheet.css', 'env-sheet-viewport'],
  ])
    assert.match(
      sheets[sheet],
      new RegExp(`\\.${layer} \\{[^}]*position: fixed;[^}]*container: env-window / inline-size;`),
      `${layer} is the env-window container of its surface`,
    );
  assert.match(sheets['Toast.css'], /\.env-toast-theme \{\s*container-type: normal;/);
});

test('no style sheet queries the viewport width', () => {
  const widthMedia = /@media[^{]*\b(?:min-|max-)?width\b/;
  const found = Object.entries(sheets)
    .filter(([, css]) => widthMedia.test(css))
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
