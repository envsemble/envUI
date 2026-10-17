import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { clientReasonsOf, libraryModules } from '../scripts/ClientModules.mjs';

// envUI and React Server Components: each module that uses client-only React APIs starts with
// 'use client', the entry points carry no directive, the build keeps the directives where they
// are, and a server component's module graph imports the package and renders envUI on the server.

const repository = fileURLToPath(new URL('../', import.meta.url));
const dist = join(repository, 'packages/ui/dist');
const modules = await libraryModules();

/** The entry points, whose `export *` and `export * as` lines a server component imports through. */
const entries = ['index', 'content', 'diff', 'rich-text', 'theme-bootstrap', 'icons/index'];

const startsWithDirective = (code) => /^\s*(['"])use client\1;?/.test(code);

test("every module that uses client-only APIs, and only such a module, says 'use client'", () => {
  const missing = modules
    .filter((module) => module.reasons.length > 0 && !module.client)
    .map((module) => `${module.file} ${module.reasons[0]}`);
  const needless = modules
    .filter((module) => module.reasons.length === 0 && module.client)
    .map((module) => module.file);
  assert.deepEqual(missing, [], 'Run node scripts/ClientModules.mjs, or npm run icons:generate.');
  assert.deepEqual(needless, [], 'These modules use nothing client-only.');
  for (const entry of entries) {
    const module = modules.find(({ file }) => file.replace(/\.tsx?$/, '') === entry);
    assert.ok(module, entry);
    assert.equal(module.client, false, `${entry} stays a server module`);
  }
  // Menu.Item is a part of a client module; the Menu namespace is an `export * as` in the entry.
  assert.ok(modules.find(({ file }) => file === 'navigation/Menu.tsx').client);
});

test('the check sees what makes a module a client module, also by name and through types', () => {
  const cases = [
    // Handlers the module makes, passed by name, through a spread or to createElement.
    [
      'export function A() { const focus = () => {}; return <span onMouseDown={focus} />; }',
      ['passes a function to onMouseDown'],
    ],
    [
      'function focus() {}\nexport function A() { return <span onMouseDown={focus} />; }',
      ['passes a function to onMouseDown'],
    ],
    [
      "import { createElement } from 'react';\nexport const B = () => createElement('button', { onClick: () => {} });",
      ['passes a function to createElement'],
    ],
    [
      'export function C() { const handlers = { onClick() {} }; return <button {...handlers} />; }',
      ['spreads a function into button'],
    ],
    // Client-only calls, also under another name.
    [
      "import { createPortal } from 'react-dom';\nexport const D = ({ c }: { c: any }) => createPortal(c, document.body);",
      ['calls createPortal'],
    ],
    [
      "import { useState as state } from 'react';\nexport function E() { const [value] = state(0); return <i>{value}</i>; }",
      ['calls useState as state'],
    ],
    // A comment gives a reason the reading cannot see.
    [
      '// @client-module The editor reads the DOM when it loads.\nexport const value = 1;',
      ['is marked @client-module: The editor reads the DOM when it loads.'],
    ],
    // What a server parent may pass on, and functions made only when it passed one, are not.
    [
      'export function F({ onClick, ...props }: { onClick?: () => void }) { return <button onClick={onClick} {...props} />; }',
      [],
    ],
    [
      'export function G({ onPick }: { onPick?: (id: number) => void }) { const pick = onPick && (() => onPick(1)); return <button onClick={pick} />; }',
      [],
    ],
    ['export const H = ({ label }: { label: string }) => <b title={label}>{label}</b>;', []],
    // The guard written the other way round, and a prop passed on in a shorthand spread.
    [
      'export function I({ onPick }: { onPick?: () => void }) { return <button onClick={!onPick ? undefined : () => onPick()} />; }',
      [],
    ],
    [
      'export function J({ onClick }: { onClick?: () => void }) { return <button {...{ onClick }} />; }',
      [],
    ],
    // Also when the prop is destructured in the body, and through a variable that holds the props.
    [
      'export function J2(props: { onClick?: () => void }) { const { onClick } = props; return <div {...{ onClick }} />; }',
      [],
    ],
    [
      'export function J3(props: { handlers: { onClick?: () => void } }) { const { handlers } = props; const { onClick } = handlers; return <div {...{ onClick }} />; }',
      [],
    ],
    // A shorthand for a function the module makes, destructured from its own object, still counts.
    [
      'export function J4() { const { onClick } = { onClick: () => {} }; return <div {...{ onClick }} />; }',
      ['spreads a function into div'],
    ],
    // So does a default that makes a function, which a server parent that passes none gets.
    [
      'export function J5(props: { onClick?: () => void }) { const { onClick = () => {} } = props; return <div {...{ onClick }} />; }',
      ['spreads a function into div'],
    ],
    [
      'function noop() {}\nexport function J6(props: { handlers: { onClick?: () => void } }) { const { handlers: { onClick = noop } } = props; return <div {...{ onClick }} />; }',
      ['spreads a function into div'],
    ],
    [
      'export function J7({ onClick = () => {} }: { onClick?: () => void }) { return <button onClick={onClick} />; }',
      ['passes a function to onClick'],
    ],
    // A default that is not a function keeps the prop passed on.
    [
      'export function J8(props: { onClick?: () => void }) { const { onClick = undefined } = props; return <div {...{ onClick }} />; }',
      [],
    ],
    // A class component of either base, and the marker only in a comment, not a string.
    [
      "import { PureComponent } from 'react';\nexport class K extends PureComponent { render() { return null; } }",
      ['is a class component'],
    ],
    [
      "export const L = '// @client-module not a comment';\nexport const M = `/* @client-module nor this */`;",
      [],
    ],
  ];
  for (const [source, reasons] of cases) assert.deepEqual(clientReasonsOf(source), reasons, source);
});

test('the build keeps each directive at the top of its module, and adds none', async () => {
  assert.ok(existsSync(join(dist, 'index.js')), 'Build the library first: npm run build:library.');
  for (const module of modules) {
    const built = join(dist, module.file.replace(/\.tsx?$/, '.js'));
    if (!existsSync(built)) continue;
    assert.equal(
      startsWithDirective(await readFile(built, 'utf8')),
      module.client,
      `dist/${module.file.replace(/\.tsx?$/, '.js')}`,
    );
  }
});

test('a server component imports envUI and renders it on the server', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--conditions=react-server',
      '--import',
      './tests/rsc/ClientReferences.mjs',
      'tests/rsc/ServerRender.mjs',
    ],
    { cwd: repository, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  const result = JSON.parse(output);
  // A part reached through its namespace is a client reference, which the server sends as such.
  assert.equal(result.menuItem, true);
  // Plain functions stay functions on the server.
  assert.equal(result.themeBootstrapScript, 'string');
  assert.equal(result.bootstrapEntryScript, 'string');
  // The server writes the application's contrast into the script, which sets it before paint.
  assert.ok(result.bootstrapContrastScript.includes('r.setAttribute("data-env-contrast","high")'));
  assert.equal(result.relativeTime, '3 hours ago');
  assert.deepEqual(result.diffLines, { result: { additions: 2, deletions: 1 } });
  assert.ok(
    result.richTextExtensions.result?.includes('envReference'),
    result.richTextExtensions.error,
  );
  for (const [entry, survey] of Object.entries(result.surveys)) {
    assert.deepEqual(survey.failed, [], `${entry}: every server component renders on the server`);
    assert.ok(survey.client.length > 0, `${entry} has client components`);
  }
  const main = result.surveys['@envsemble/envui'];
  // Each server component renders with its documented variants too: pending, href, icon-only…
  const variants = {
    Button: [
      '(defaults)',
      'variant="ghost"',
      'tone="danger"',
      'pending',
      'disabled',
      'href="/destination"',
      'href="/destination" pending',
      'href="/destination" disabled',
      'iconOnly icon={…} aria-label="Home"',
    ],
    Link: ['(defaults)', 'href="/destination"', 'href="/destination" disabled'],
    Card: ['layout="feature"', 'href="/destination"'],
    Badge: ['tone="danger"', 'variant="solid"'],
    Alert: ['tone="danger"', 'announce'],
    Text: ['variant="headline"', 'emphasis="muted"'],
  };
  for (const [name, expected] of Object.entries(variants))
    for (const variant of expected)
      assert.ok(
        main.variants[name]?.includes(variant),
        `${name} renders on the server with ${variant}`,
      );
  for (const name of ['Badge', 'Card', 'Text', 'Button', 'Alert', 'List.Item', 'Stat.Root'])
    assert.ok(main.server.includes(name), `${name} renders on the server`);
  for (const name of [
    'Menu.Item',
    'Theme',
    'Dialog',
    'Table.Root',
    'useToast',
    'EnvUIProvider',
    'CloseButton',
    'Toolbar.Root',
    'Field.Root',
  ])
    assert.ok(main.client.includes(name), `${name} is a client reference`);
  // The page's client components receive only what a server can send them.
  const page = JSON.stringify(result.page);
  assert.match(page, /"client":"navigation\/Menu\.js#Item"/);
  assert.match(page, /"client":"icons\/Home\.js#Home"/);
  // A pending Button hands ActionElement a boolean, not a click handler.
  assert.match(
    page,
    /"client":"internal\/ActionElement\.js#ActionElement","props":\{"pending":true/,
  );
  assert.match(page, /"element":"div","props":\{"role":"status","className":"env-alert"/);
});
