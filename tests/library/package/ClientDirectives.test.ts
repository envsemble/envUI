import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { test } from 'node:test';
import { clientReasonsOf, libraryModules } from '../../../scripts/build/ClientModules.ts';
import { libraryEntryPoints } from '../../../scripts/docs/LibraryEntryPoints.ts';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';
import { pathToFileURL } from 'node:url';

const dist = join(repositoryRoot, 'packages/ui/dist');
const modules = await libraryModules();

const entries = libraryEntryPoints().map(({ file }) =>
  relative(join(repositoryRoot, 'packages/ui/src'), file).split(sep).join('/'),
);

const startsWithDirective = (code) => /^\s*(['"])use client\1;?/.test(code);

test("every module that uses client-only APIs, and only such a module, says 'use client'", () => {
  const missing = modules
    .filter((module) => module.reasons.length > 0 && !module.client)
    .map((module) => `${module.file} ${module.reasons[0]}`);
  const needless = modules
    .filter((module) => module.reasons.length === 0 && module.client)
    .map((module) => module.file);
  assert.deepEqual(
    missing,
    [],
    'Run node scripts/build/ClientModules.ts, or npm run icons:generate.',
  );
  assert.deepEqual(needless, [], 'These modules use nothing client-only.');
  for (const entry of entries) {
    const module = modules.find(({ file }) => file === entry);
    assert.ok(module, entry);
    assert.equal(module.client, false, `${entry} stays a server module`);
  }
  assert.ok(modules.find(({ file }) => file === 'actions/menu/Menu.tsx').client);
});

test('the check sees what makes a module a client module, also by name and through types', () => {
  const handlersTheModuleMakes = [
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
  ];
  const clientOnlyCallsUnderAnyName = [
    [
      "import { createPortal } from 'react-dom';\nexport const D = ({ c }: { c: any }) => createPortal(c, document.body);",
      ['calls createPortal'],
    ],
    [
      "import { useState as state } from 'react';\nexport function E() { const [value] = state(0); return <i>{value}</i>; }",
      ['calls useState as state'],
    ],
  ];
  const clientModuleMarkerComments = [
    [
      '// @client-module The editor reads the DOM when it loads.\nexport const value = 1;',
      ['is marked @client-module: The editor reads the DOM when it loads.'],
    ],
  ];
  const propsAServerParentPassesOn = [
    [
      'export function F({ onClick, ...props }: { onClick?: () => void }) { return <button onClick={onClick} {...props} />; }',
      [],
    ],
    [
      'export function G({ onPick }: { onPick?: (id: number) => void }) { const pick = onPick && (() => onPick(1)); return <button onClick={pick} />; }',
      [],
    ],
    ['export const H = ({ label }: { label: string }) => <b title={label}>{label}</b>;', []],
  ];
  const reversedGuardsAndShorthandSpreads = [
    [
      'export function I({ onPick }: { onPick?: () => void }) { return <button onClick={!onPick ? undefined : () => onPick()} />; }',
      [],
    ],
    [
      'export function J({ onClick }: { onClick?: () => void }) { return <button {...{ onClick }} />; }',
      [],
    ],
  ];
  const propsDestructuredInTheBodyOrFromAVariable = [
    [
      'export function J2(props: { onClick?: () => void }) { const { onClick } = props; return <div {...{ onClick }} />; }',
      [],
    ],
    [
      'export function J3(props: { handlers: { onClick?: () => void } }) { const { handlers } = props; const { onClick } = handlers; return <div {...{ onClick }} />; }',
      [],
    ],
  ];
  const shorthandsForFunctionsTheModuleMakes = [
    [
      'export function J4() { const { onClick } = { onClick: () => {} }; return <div {...{ onClick }} />; }',
      ['spreads a function into div'],
    ],
  ];
  const defaultsThatMakeAFunction = [
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
  ];
  const defaultsThatAreNotFunctions = [
    [
      'export function J8(props: { onClick?: () => void }) { const { onClick = undefined } = props; return <div {...{ onClick }} />; }',
      [],
    ],
  ];
  const classComponentsAndMarkersOnlyInComments = [
    [
      "import { PureComponent } from 'react';\nexport class K extends PureComponent { render() { return null; } }",
      ['is a class component'],
    ],
    [
      "export const L = '// @client-module not a comment';\nexport const M = `/* @client-module nor this */`;",
      [],
    ],
  ];
  const cases = [
    ...handlersTheModuleMakes,
    ...clientOnlyCallsUnderAnyName,
    ...clientModuleMarkerComments,
    ...propsAServerParentPassesOn,
    ...reversedGuardsAndShorthandSpreads,
    ...propsDestructuredInTheBodyOrFromAVariable,
    ...shorthandsForFunctionsTheModuleMakes,
    ...defaultsThatMakeAFunction,
    ...defaultsThatAreNotFunctions,
    ...classComponentsAndMarkersOnlyInComments,
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
      './tests/library/package/rsc/ClientReferences.ts',
      'tests/library/package/rsc/ServerRender.ts',
    ],
    { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  const result = JSON.parse(output);
  assert.equal(result.menuItem, true);
  assert.equal(result.themeBootstrapScript, 'string');
  assert.equal(result.bootstrapEntryScript, 'string');
  assert.equal(result.storedBootstrapScript, 'string');
  assert.equal(result.storedPreferenceHook, true);
  assert.ok(result.bootstrapContrastScript.includes('r.setAttribute("data-env-contrast","high")'));
  assert.equal(result.relativeTime, '3 hours ago');
  assert.deepEqual(result.diffLines, { result: { additions: 2, deletions: 1 } });
  for (const [entry, survey] of Object.entries(result.surveys)) {
    assert.deepEqual(survey.failed, [], `${entry}: every server component renders on the server`);
    assert.ok(survey.client.length > 0, `${entry} has client components`);
  }
  const main = result.surveys['@envsemble/envui'];
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
    ],
    Link: ['(defaults)', 'href="/destination"', 'href="/destination" disabled'],
    Card: ['href="/destination"'],
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
  for (const name of ['Badge', 'Card', 'Text', 'Button', 'Alert', 'List.Item'])
    assert.ok(main.server.includes(name), `${name} renders on the server`);
  for (const name of [
    'Menu.Item',
    'Theme',
    'Dialog',
    'Table.Root',
    'useToast',
    'EnvUIProvider',
    'Toolbar.Root',
    'Field.Root',
  ])
    assert.ok(main.client.includes(name), `${name} is a client reference`);
  const page = JSON.stringify(result.page);
  assert.match(page, /"client":"actions\/menu\/Menu\.js#Item"/);
  assert.match(page, /"client":"icons\/Home\.js#IconHome"/);
  assert.match(
    page,
    /"client":"internal\/control\/ActionElement\.js#ActionElement","props":\{"pending":true/,
  );
  assert.match(page, /"element":"div","props":\{"role":"status","className":"env-alert"/);
  const list = JSON.stringify(result.list);
  assert.doesNotMatch(list, /"client":/);
  assert.match(list, /"element":"a","props":\{"href":"\/plans\/launch",[^}]*"aria-current":"true"/);
  assert.match(
    list,
    /"element":"li","props":\{[^{}]*"aria-current":"true","className":"env-list-item env-connected-row","data-selected":""/,
  );
  assert.equal(list.match(/"aria-current"/g)?.length, 2);
});

function clientReferenceType(value, status = 'fulfilled') {
  const chunk = { status, value, reason: new Error('failed'), then() {} };
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: chunk,
    _init(payload) {
      if (payload.status === 'fulfilled') return payload.value;
      throw payload.status === 'pending' ? payload : payload.reason;
    },
  };
}

test('a Tooltip a server component writes around a Menu.Root describes its trigger', async () => {
  const { createElement: h } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const ui = await import('@envsemble/envui');
  const { isTriggerOwner, isTooltip } = await import(
    pathToFileURL(join(repositoryRoot, 'packages/ui/dist/internal/trigger/triggerOwner.js')).href
  );
  const trigger = h('button', { type: 'button', 'aria-label': 'Sort' });
  const markup = renderToString(
    h(
      ui.Tooltip,
      { content: 'Sort rows' },
      h(clientReferenceType(ui.Menu.Root), { trigger, label: 'Sort' }, h(ui.Menu.Item, null, 'A')),
    ),
  );
  assert.match(markup, /^<button [^>]*aria-haspopup="menu"[^>]*data-base-ui-tooltip-trigger=""/);
  for (const status of ['fulfilled', 'pending', 'rejected']) {
    assert.equal(isTriggerOwner(clientReferenceType(ui.Menu.Root, status), { trigger }), true);
    assert.equal(
      isTriggerOwner(clientReferenceType(ui.Menu.Root, status), {}),
      status === 'fulfilled',
    );
  }
  assert.equal(isTriggerOwner(clientReferenceType(ui.Button), { trigger }), false);
  assert.equal(isTooltip(clientReferenceType(ui.Tooltip)), true);
  assert.equal(isTooltip(clientReferenceType(ui.Tooltip, 'pending')), false);
  assert.equal(isTooltip(clientReferenceType(ui.Button)), false);
});
