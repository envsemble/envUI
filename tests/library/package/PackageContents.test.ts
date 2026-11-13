// What the packed package holds: its files, its style sheet, scoped to envUI's elements, its fonts,
// licenses, icons, README, documentation and contract data, and the command it installs.
import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { compileDocumentation } from '../../../scripts/docs/Compiler.ts';
import { ruleSelectors, scopedSelector, splitSelectors } from '../../support/CssScope.ts';
import { installTimeout, packedConsumer } from '../../support/PackedConsumer.ts';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

let consumer;
before(async () => (consumer = await packedConsumer()), { timeout: installTimeout });

test('the packed package ships no logos', () => {
  assert.ok(consumer.packedFiles.includes('dist/assets/Geist.woff2'), 'The pack lists its files.');
  const images = consumer.packedFiles.filter((path) => /\.(?:svg|png|ico)$/i.test(path));
  // The README's captures of the website's overview and its components' gallery, and the spark
  // that marks a bullet in formatted text (Prose.css), are the only images the package ships.
  assert.deepEqual(
    images.filter(
      (path) =>
        !/^dist\/assets\/readme\/(?:overview|gallery)-(?:light|dark)\.png$/.test(path) &&
        path !== 'dist/assets/spark.svg',
    ),
    [],
  );
  assert.deepEqual(
    consumer.packedFiles.filter((path) => /(?:^|\/)(?:brand|envUI)\/|lockup|favicon/i.test(path)),
    [],
  );
});

test('the CSS scope check accepts only selectors that match envUI elements', () => {
  for (const selector of [
    '.env-theme',
    'button.env-button',
    '.env-theme:where(:not(html))',
    '.env-theme:where(html)',
    'html.env-theme',
    'html.env-theme > body',
    ':where(.env-theme) .env-button',
    '.env-markdown > * + *',
    '.env-button + .env-button',
    ":where(html:has(.env-scaffold[data-scroll='document']))",
    ":where([data-env-layout='row'], [data-env-layout='column']) > *",
    ':where([data-env-layout][data-gap="4"])',
  ])
    assert.ok(scopedSelector(selector), selector);
  for (const selector of [
    'body',
    ':root',
    ':where(body)',
    ':where(.env-theme, body)',
    ':where([data-gap])',
    '[data-layout] > *',
    ':where(.env-theme) , body',
    ':where(.env-theme',
    ':where(html:has(body))',
    ':where(html:has(.env-scaffold) body)',
    ':where(html:has(.env-scaffold)) *',
    ':where(html:has(.env-scaffold)) body',
    ':where(html:has(.env-scaffold)) p',
    ':where(html:has(.env-scaffold)) ~ div',
    ':where(:where(html:has(.env-x))) input',
    'html:has(.env-scaffold)',
    'html:has(.env-scaffold) body',
    'body:has(.env-scaffold)',
    '.env-theme:where(html) *',
    'html.env-theme body',
    'HTML.env-theme body',
    '.env-theme *|html',
    ':where(.env-x,html) *',
    '.env-theme:not(:not(html)) *',
    ':where(.env-theme:where(html) > body) p',
    ':where(.env-theme) ~ div',
    '.env-theme + p',
    '.env-theme ~ *',
  ])
    assert.ok(!scopedSelector(selector), selector);
  // A statement such as @layer a; does not hide the rule after it.
  assert.deepEqual(ruleSelectors('@layer envui-document; body { color: red }'), ['body']);
});

test('the package includes scoped CSS, local fonts, branding and license notices', async () => {
  const stylesheet = consumer.require.resolve('@envsemble/envui/styles.css');
  const css = await readFile(stylesheet, 'utf8');
  assert.ok(/\.env-theme\s*\{/.test(css), 'Missing explicit theme boundary.');
  assert.ok(/\[data-env-theme=["']?dark["']?\]/.test(css), 'Missing dark theme boundary.');
  assert.ok(
    /\[data-env-contrast=["']?high["']?\]/.test(css),
    'Missing high-contrast theme boundary.',
  );
  assert.ok(
    /@media\s*\(prefers-contrast:\s*more\)/.test(css),
    'Map prefers-contrast: more onto the high-contrast themes.',
  );
  assert.ok(
    /--env-color-bg-primary-emphasis-hover:\s*#[0-9a-f]{3,8}\b/i.test(css),
    'Hover and pressed colors are precomputed tokens.',
  );
  assert.ok(
    !/sign\(|--state-[a-z-]*lightness/.test(css),
    'No runtime lightness rule: every state color is a token the contrast gate can measure.',
  );
  assert.ok(
    /@font-face\s*\{[^}]*font-family:\s*["']envUI Geist["']/.test(css),
    'Missing owned font family.',
  );
  assert.ok(
    !/:root|\.hover\b|\.pressed\b|\.focus\b|https?:\/\//.test(css),
    'CSS must exclude host resets, specimen states, and remote assets.',
  );
  const ruleHeaders = ruleSelectors(css);
  assert.ok(ruleHeaders.length > 50, 'Inspect the full component stylesheet.');
  for (const header of ruleHeaders) {
    if (header.startsWith('@')) continue;
    // Keyframe steps inside @keyframes are offsets, not element selectors.
    if (/^(?:from|to|\d+(?:\.\d+)?%)(?:\s*,\s*(?:from|to|\d+(?:\.\d+)?%))*$/.test(header)) continue;
    for (const selector of splitSelectors(header)) {
      assert.ok(scopedSelector(selector), `Unscoped CSS selector: ${selector}`);
    }
  }
  for (const match of css.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) {
    assert.ok(
      !/^(?:https?:|\/|data:)/.test(match[1]),
      'The package font must resolve from a local asset.',
    );
    assert.ok(existsSync(resolve(dirname(stylesheet), match[1])), `Missing CSS asset: ${match[1]}`);
  }
  assert.equal(
    (await readFile(consumer.require.resolve('@envsemble/envui/assets/Geist.woff2')))
      .subarray(0, 4)
      .toString(),
    'wOF2',
  );
  for (const filename of ['README.md', 'THIRD_PARTY_NOTICES.md', 'icon-manifest.json']) {
    assert.ok(
      (await readFile(join(consumer.installedDirectory, filename))).length > 0,
      `Missing packaged guidance: ${filename}`,
    );
  }
  // The contract data resolves by name, so an application never keeps a copy of it.
  const parts = JSON.parse(await readFile(consumer.require.resolve('@envsemble/envui/parts.json')));
  assert.ok(parts.components.Button, 'parts.json lists the components');
  const props = JSON.parse(await readFile(consumer.require.resolve('@envsemble/envui/props.json')));
  assert.ok(props.exports.Button, 'props.json lists the exports');
  const tokens = JSON.parse(
    await readFile(consumer.require.resolve('@envsemble/envui/tokens.json')),
  );
  assert.ok(tokens.tokens.length > 100, 'tokens.json lists the tokens');
  // The agent tooling of the prereleases is gone: agents read docs/, and the site serves the setup
  // skill and llms.txt.
  for (const removed of ['skills', 'manifest.json', 'llms.txt', 'llms-full.txt'])
    assert.equal(existsSync(join(consumer.installedDirectory, removed)), false, removed);
  const installedManifest = JSON.parse(
    await readFile(join(consumer.installedDirectory, 'package.json'), 'utf8'),
  );
  // The one command is envui-graphic, which trims a picture's empty edges; it loads sharp only
  // when it runs, so an application without sharp installs and runs envUI as before, and the
  // command says what to install.
  assert.deepEqual(installedManifest.bin, { 'envui-graphic': 'bin/envui-graphic.js' });
  const graphicBin = join(consumer.installedDirectory, 'bin/envui-graphic.js');
  assert.match(consumer.run(graphicBin, ['--help']), /^Usage: npx envui-graphic <file>/);
  await writeFile(join(consumer.directory, 'logo.png'), '');
  assert.throws(
    () => consumer.run(graphicBin, ['logo.png']),
    /envui-graphic needs sharp to read pictures, and the project has none/,
  );
  assert.match(
    await readFile(
      join(consumer.installedDirectory, 'licenses/Runtime-Dependencies-LICENSE.txt'),
      'utf8',
    ),
    /@base-ui\/react@1\.9\.0/,
  );
  for (const filename of [
    'Base-UI-LICENSE.txt',
    'Geist-LICENSE.txt',
    'Material-Symbols-LICENSE.txt',
  ]) {
    assert.ok((await readFile(join(consumer.installedDirectory, 'licenses', filename))).length > 0);
  }
});

test('the package holds the generated icons, one module each', async () => {
  assert.ok(
    (await readdir(join(consumer.installedDirectory, 'dist/icons'))).length > 100,
    'The package contains the generated catalogue.',
  );
});

test('the packed README links only what the package ships, and the packed documentation matches its sources', async () => {
  const packagedReadme = await readFile(join(consumer.installedDirectory, 'README.md'), 'utf8');
  const readmeResources = [
    ...[...packagedReadme.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]),
    ...[...packagedReadme.matchAll(/\b(?:src|srcset)="([^"]+)"/g)].map((match) => match[1]),
  ];
  for (const target of readmeResources) {
    if (/^https?:\/\//.test(target)) continue;
    const resource = resolve(consumer.installedDirectory, target);
    const contained = relative(consumer.installedDirectory, resource);
    assert.ok(!contained.startsWith('..') && !isAbsolute(contained));
    assert.ok(
      existsSync(resource),
      `README resource is absent from the installed package: ${target}`,
    );
  }
  // The package ships the compiled pages: examples and generated props filled in, the example
  // sources beside them, and the props of every export as JSON.
  const compiled = compileDocumentation();
  assert.ok(compiled.has('components/dialog.md'));
  assert.ok(compiled.has('components/rich-text.md'));
  assert.ok([...compiled.keys()].some((path) => path.startsWith('examples/')));
  for (const [path, contents] of compiled) {
    assert.equal(
      await readFile(join(consumer.installedDirectory, 'docs', path), 'utf8'),
      contents,
      `Packaged documentation differs from its release source: ${path}`,
    );
  }
  assert.deepEqual(
    JSON.parse(
      await readFile(join(consumer.installedDirectory, 'docs/generated/props.json'), 'utf8'),
    ),
    JSON.parse(await readFile(join(repositoryRoot, 'docs/generated/props.json'), 'utf8')),
  );
});
