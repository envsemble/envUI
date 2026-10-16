import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, mkdtemp, rm, lstat, readdir } from 'node:fs/promises';
import { dirname, join, resolve, relative, isAbsolute, delimiter } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { readDocumentation } from '../scripts/GenerateDocumentation.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const cacheDirectory = join(repository, '.cache');
let fixtureDirectory;
let consumerDirectory;
let installedDirectory;
let consumerRequire;
let ssr;
let isolationHook;

function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    '/usr/share/nodejs/npm/bin/npm-cli.js',
    ...(process.env.PATH ?? '')
      .split(delimiter)
      .map((directory) => join(directory, 'node_modules/npm/bin/npm-cli.js')),
  ];
  const candidate = candidates.find((path) => path?.endsWith('.js') && existsSync(path));
  assert.ok(
    candidate,
    'Run this suite through npm test, or provide a Node installation containing npm.',
  );
  return candidate;
}

function run(script, args = [], cwd = consumerDirectory) {
  try {
    const hook =
      isolationHook && script.startsWith(consumerDirectory)
        ? ['--import', pathToFileURL(isolationHook).href]
        : [];
    return execFileSync(process.execPath, [...hook, script, ...args], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !/^npm_/i.test(name))),
        NODE_OPTIONS: '',
        npm_config_audit: 'false',
        npm_config_fund: 'false',
      },
    });
  } catch (error) {
    const detail = [error.stdout, error.stderr].filter(Boolean).join('\n').slice(-12000);
    throw new Error(`Consumer command failed: ${script}\n${detail}`, { cause: error });
  }
}

async function runConsumer(name, source) {
  const script = join(consumerDirectory, name);
  await writeFile(script, source);
  return JSON.parse(run(script));
}

before(
  async function installPackedConsumer() {
    await mkdir(cacheDirectory, { recursive: true });
    fixtureDirectory = await mkdtemp(join(cacheDirectory, 'package-consumer-'));
    consumerDirectory = join(fixtureDirectory, 'consumer');
    const packedDirectory = join(fixtureDirectory, 'packed');
    await mkdir(consumerDirectory);
    await mkdir(packedDirectory);
    const manifest = JSON.parse(await readFile(join(repository, 'package.json'), 'utf8'));
    const packResult = JSON.parse(
      run(
        npmCli(),
        ['pack', '--json', '--pack-destination', packedDirectory],
        join(repository, 'packages/ui'),
      ),
    );
    const packed = Array.isArray(packResult) ? packResult : Object.values(packResult);
    assert.equal(packed.length, 1);
    const dependencies = {};
    for (const name of [
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom',
      'typescript',
      'esbuild',
    ]) {
      dependencies[name] = manifest.devDependencies[name];
    }
    // This consumer uses the content and rich-text entries, so it installs their optional peers.
    const libraryManifest = JSON.parse(
      await readFile(join(repository, 'packages/ui/package.json'), 'utf8'),
    );
    for (const name of Object.keys(libraryManifest.peerDependenciesMeta ?? {})) {
      dependencies[name] = libraryManifest.devDependencies[name];
    }
    dependencies['@envsemble/envui'] = `file:../packed/${packed[0].filename}`;
    await writeFile(
      join(consumerDirectory, 'package.json'),
      JSON.stringify({ private: true, type: 'module', dependencies }, null, 2),
    );
    run(npmCli(), ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error']);
    consumerRequire = createRequire(join(consumerDirectory, 'package.json'));
    installedDirectory = dirname(consumerRequire.resolve('@envsemble/envui/package.json'));
    isolationHook = join(consumerDirectory, 'IsolationHook.mjs');
    await writeFile(
      isolationHook,
      `
    import { registerHooks } from 'node:module';
    import { relative, isAbsolute } from 'node:path';
    import { fileURLToPath } from 'node:url';
    const boundary = ${JSON.stringify(consumerDirectory)};
    registerHooks({ resolve(specifier, context, nextResolve) {
      const result = nextResolve(specifier, context);
      if (result.url.startsWith('file:')) {
        const path = relative(boundary, fileURLToPath(result.url));
        if (path.startsWith('..') || isAbsolute(path)) throw new Error('Consumer resolved a dependency outside its installation: ' + result.url);
      }
      return result;
    } });
  `,
    );
    ssr = await runConsumer(
      'SSRConsumer.mjs',
      `
    import { createElement as h } from 'react';
    import { renderToString } from 'react-dom/server';
    import * as ui from '@envsemble/envui';
    import * as themeBootstrap from '@envsemble/envui/theme-bootstrap';
    import { Home } from '@envsemble/envui/icons/Home';
    import { Home as BarrelHome } from '@envsemble/envui/icons';
    if (typeof document !== 'undefined' || typeof window !== 'undefined') throw new Error('DOM globals must be absent');
    function ThemeProbe() { return h('span', { 'data-originating-theme': ui.useTheme() }); }
    const custom = h(ui.Icon, { label: 'Custom star', viewBox: '0 0 8 8' }, h('path', { d: 'M0 0L8 8' }));
    const html = renderToString(h(ui.Theme, { theme: 'dark' },
      h(ThemeProbe),
      h(ui.Button, { startIcon: h(Home) }, 'Create'),
      h(ui.IconButton, { icon: custom, 'aria-label': 'Open item' }),
      h(ui.ButtonGroup, { orientation: 'vertical', 'aria-label': 'Connected actions' },
        h(ui.Button, { startIcon: h(Home) }, 'Continue'),
        h(ui.IconButton, { icon: custom, 'aria-label': 'Settings' }),
        h(ui.Button, { variant: 'important', href: '/confirm' }, 'Confirm')),
      h(ui.Pager.Previous, { href: '/previous-guide' }, 'Earlier guide'),
      h(ui.Pager.Next, { href: '/next-guide', icon: custom }, 'Following guide'),
      h(ui.TextField, { name: 'title', label: 'Title', hint: 'One line', defaultValue: 'Example' }),
      h(ui.ColorPicker, { name: 'accent', label: 'Accent color', defaultValue: 'ABCDEF' }),
      h(ui.Textarea, { name: 'description', label: 'Description', defaultValue: 'Content' }),
      h(ui.Checkbox, { name: 'enabled', label: 'Enabled', defaultChecked: true }),
      h(ui.Switch, { name: 'alerts', label: 'Alerts' }),
      h(ui.RadioGroup, { name: 'mode', label: 'Mode', defaultValue: 'one' }, h(ui.Radio, { value: 'one', label: 'One' })),
      h(ui.Select, { name: 'choice', label: 'Choice', options: [{ value: 'one', label: 'One' }], defaultValue: 'one' }),
      h(ui.Combobox, { name: 'owner', label: 'Owner', items: [{ value: 'first', label: 'First person' }], defaultValue: 'first' }),
      h(ui.Combobox, { name: 'reviewers', label: 'Reviewers', multiple: true, items: [{ label: 'Team', items: [{ value: 'second', label: 'Second person' }] }], defaultValue: ['second'] }),
      h(ui.DatePicker, { name: 'due', label: 'Due', defaultValue: '2026-10-14T09:30', withTime: true, locale: 'en-GB' }),
      h(ui.Calendar, { 'aria-label': 'Planning', defaultValue: '2026-03-09', locale: 'en-GB', weekStart: 1 }),
      h(ui.Dialog, { title: 'Example', open: false, trigger: h(ui.Button, null, 'Open') }),
      h(ui.Toast.Provider, null, 'Managed notifications'),
      h(ui.BrandLogo),
      h(ui.LoadingState, null, h(ui.Skeleton, { width: '38%' }))
    ));
    console.log(JSON.stringify({
      exports: Object.keys(ui), themeBootstrapExports: Object.keys(themeBootstrap), html,
      partNames: [ui.Menu.Root, ui.Menu.Item, ui.Menubar.Menu, ui.Table.HeaderCell, ui.Stat.Group, ui.Toast.Provider].map((part) => part.displayName),
      emptyPager: renderToString(h(ui.Pager.Root, { previous: null, next: null })),
      pairedPager: renderToString(h(ui.Pager.Root, {
        'aria-label': 'Guide sequence',
        previous: { href: '/before', children: 'Before', target: '_blank', rel: 'noopener' },
        next: { href: '/after', children: 'After' },
      })),
      defaultIcon: renderToString(h(Home)), filledIcon: renderToString(h(Home, { filled: true, label: 'Home' })),
      barrelIcon: renderToString(h(BarrelHome)), customIcon: renderToString(custom),
      selectedNavigation: renderToString(h(ui.NavList.Item, { selected: true, icon: h(Home, { filled: false }) }, 'Home')),
      unselectedNavigation: renderToString(h(ui.NavList.Item, { icon: h(Home, { filled: true }) }, 'Home')),
      navigationList: renderToString(h(ui.NavList.Root, { 'aria-label': 'Main' },
        h(ui.NavList.Item, { href: '/home' }, 'Home'),
        h(ui.NavList.Group, { label: 'Settings' }, h(ui.NavList.Item, { href: '/profile' }, 'Profile')))),
      module: import.meta.resolve('@envsemble/envui'), iconsModule: import.meta.resolve('@envsemble/envui/icons'),
      homeModule: import.meta.resolve('@envsemble/envui/icons/Home'),
      reactModule: import.meta.resolve('react'),
      colorPickerModule: import.meta.resolve('react-colorful'),
      css: import.meta.resolve('@envsemble/envui/styles.css'),
      font: import.meta.resolve('@envsemble/envui/assets/Inter.woff2'),
      logo: import.meta.resolve('@envsemble/envui/assets/envsemble-lockup-black.svg')
    }));
  `,
    );
  },
  { timeout: 240000 },
);

after(async function removeConsumerFixture() {
  if (!fixtureDirectory) return;
  const containedPath = relative(cacheDirectory, resolve(fixtureDirectory));
  assert.ok(
    containedPath && !containedPath.startsWith('..') && !isAbsolute(containedPath),
    'Only delete the fixture created inside .cache.',
  );
  await rm(fixtureDirectory, { recursive: true, force: true });
});

test('pagers omit empty navigation and preserve destination attributes', () => {
  assert.equal(ssr.emptyPager, '');
  assert.match(ssr.pairedPager, /<nav aria-label="Guide sequence"/);
  assert.match(ssr.pairedPager, /href="\/before" target="_blank" rel="noopener"/);
  assert.match(ssr.pairedPager, /href="\/after" rel="next"/);
  assert.ok(ssr.pairedPager.indexOf('Before') < ssr.pairedPager.indexOf('After'));
});

test('a navigation list renders its items and groups as list items', () => {
  const html = ssr.navigationList;
  assert.match(html, /^<ul aria-label="Main" class="env-nav-list"><li><a [^>]*href="\/home"/);
  const label = html.match(/<span class="env-nav-list-group-label" id="([^"]+)">Settings<\/span>/);
  assert.ok(label, 'The group shows its label.');
  assert.ok(html.includes('</li><li class="env-nav-list-group"><span'));
  assert.match(
    html,
    new RegExp(
      `<ul class="env-nav-list-group-list" aria-labelledby="${label[1]}"><li><a [^>]*href="/profile"[^>]*>Profile</a></li></ul></li></ul>$`,
    ),
  );
});

test('no 0.x name of the rename map is exported, and every namespace is', async () => {
  const map = JSON.parse(
    await readFile(join(repository, 'packages/codemods/src/maps/v1.json'), 'utf8'),
  );
  const names = (section) => Object.keys(section).filter((name) => !name.startsWith('$'));
  const entries = {
    '@envsemble/envui': ssr.exports,
    '@envsemble/envui/theme-bootstrap': ssr.themeBootstrapExports,
  };
  // Namespaces such as Menu and Toast reuse the name of a 0.x component.
  const namespaces = new Set(
    Object.values(map.exports['@envsemble/envui'])
      .filter((name) => name.includes('.'))
      .map((name) => name.split('.')[0]),
  );
  for (const [entry, exported] of Object.entries(entries)) {
    for (const section of ['exports', 'split', 'removed'])
      for (const name of names(map[section][entry] ?? {}))
        if (!namespaces.has(name))
          assert.ok(!exported.includes(name), `${entry} still exports ${name}.`);
  }
  for (const namespace of namespaces)
    assert.ok(ssr.exports.includes(namespace), `Missing namespace export: ${namespace}`);
});

test('compound parts are namespace members named after their part', () => {
  assert.deepEqual(ssr.partNames, [
    'Menu.Root',
    'Menu.Item',
    'Menubar.Menu',
    'Table.HeaderCell',
    'Stat.Group',
    'Toast.Provider',
  ]);
});

test('a packed consumer resolves compiled public exports and its own React installation', async function () {
  assert.equal((await lstat(installedDirectory)).isSymbolicLink(), false);
  assert.match(ssr.module, /\/node_modules\/@envsemble\/envui\/dist\/index\.js$/);
  assert.match(ssr.iconsModule, /\/dist\/icons\/index\.js$/);
  assert.match(ssr.homeModule, /\/dist\/icons\/Home\.js$/);
  assert.match(ssr.reactModule, /\/consumer\/node_modules\/react\/index\.js$/);
  assert.equal(existsSync(join(installedDirectory, 'src')), false);
  for (const name of [
    'Theme',
    'useTheme',
    'Button',
    'ButtonGroup',
    'IconButton',
    'NavList',
    'Pager',
    'Card',
    'ClickableCard',
    'Stack',
    'ActionGroup',
    'ActionCard',
    'FeatureCard',
    'List',
    'InfoChip',
    'Disclosure',
    'EmptyState',
    'Skeleton',
    'LoadingState',
    'TextField',
    'ColorPicker',
    'Textarea',
    'Checkbox',
    'Switch',
    'RadioGroup',
    'Radio',
    'Select',
    'Combobox',
    'DatePicker',
    'Calendar',
    'Dialog',
    'DialogClose',
    'Toast',
    'useToast',
    'Icon',
    'BrandLogo',
    'DropZone',
    'Alert',
    'CounterBadge',
    'DiffStat',
    'CalendarHeatmap',
    'OrganizationSwitcher',
    'Menu',
    'ContextMenu',
    'Menubar',
    'Table',
    'Stat',
  ]) {
    assert.ok(ssr.exports.includes(name), `Missing public export: ${name}`);
  }
  const installedManifest = JSON.parse(
    await readFile(join(installedDirectory, 'package.json'), 'utf8'),
  );
  assert.match(installedManifest.peerDependencies.react, /19/);
  assert.equal(installedManifest.dependencies['react-colorful'], '5.8.1');
  // Basic UI installs without the content, rich-text and diff stacks; apps using those entries add them.
  for (const name of [
    'shiki',
    'react-markdown',
    'remark-gfm',
    'marked',
    '@tiptap/react',
    '@pierre/diffs',
  ]) {
    assert.equal(installedManifest.dependencies[name], undefined);
    assert.equal(installedManifest.peerDependenciesMeta[name]?.optional, true);
  }
  assert.match(ssr.colorPickerModule, /\/consumer\/node_modules\/react-colorful\//);
  assert.match(
    JSON.parse(await readFile(consumerRequire.resolve('react/package.json'), 'utf8')).version,
    /^19\./,
  );
});

test('installed declarations typecheck a React 19 consumer without source aliases', async function () {
  await writeFile(
    join(consumerDirectory, 'Consumer.tsx'),
    `
    import { createRef } from 'react';
    import { Theme, Button, ButtonGroup, ConfirmButton, IconButton, NavList, Pager, Icon, BrandLogo, TextField, ColorPicker, Textarea, Checkbox, Switch, Stack, ActionGroup,
      RadioGroup, Radio, Select, Combobox, DatePicker, Calendar, Dialog, DialogClose, Toast, useToast,
      type ThemeValue, type ButtonProps, type ButtonGroupProps, type SelectOption, type ComboboxItem, type ToastManager } from '@envsemble/envui';
    import { Home } from '@envsemble/envui/icons/Home';
    import { Home as BarrelHome } from '@envsemble/envui/icons';
    import '@envsemble/envui/styles.css';
    import { RichText, RichTextEditor, type RichTextEditorHandle, type RichTextReferenceSource } from '@envsemble/envui/rich-text';
    const buttonProps: ButtonProps = { variant: 'important', ref: createRef<HTMLButtonElement>(), startIcon: <Home /> };
    const buttonGroupProps: ButtonGroupProps = { orientation: 'vertical', ref: createRef<HTMLDivElement>(), 'aria-label': 'Actions' };
    const pagerLinkProps: Pager.LinkProps = { href: '/guide', children: 'Read the guide', ref: createRef<HTMLAnchorElement>(), icon: <Home /> };
    const options: SelectOption[] = [{ value: 'one', label: 'One' }];
    const people: ComboboxItem[] = [{ value: 'first', label: 'First person', description: 'first@example.com', leading: <Home /> }];
    const theme: ThemeValue = 'dark';
    const referenceSources: RichTextReferenceSource[] = [{ char: '@', items: async ({ query, signal }) => signal.aborted ? [] : [{ id: query, label: query }] }];
    const richTextConsumer = <><RichTextEditor ref={createRef<RichTextEditorHandle>()} value="Notes" references={referenceSources} onValueChange={markdown => { const typed: string = markdown; void typed; }} onUpload={async (file, { signal }) => signal.aborted ? null : ({ url: '/uploads/example', label: file.name, id: 'stable-file-id', kind: 'file' })} /><RichText onReferenceClick={(reference, event) => { event.preventDefault(); void reference.id; }}>Notes</RichText></>;
    void richTextConsumer;
    function NotificationAction() { const manager: ToastManager = useToast(); return <Button onClick={() => manager.show({ message: 'Saved' })}>Save</Button>; }
    export const consumer = <Theme theme={theme} ref={createRef<HTMLDivElement>()}>
      <Button {...buttonProps}>Create</Button><IconButton aria-label="Open" icon={<Home filled />} />
      <ConfirmButton variant="quiet" icon={<Home />} aria-label="Remove" confirmLabel="Remove?" onConfirm={() => undefined} />
      <ButtonGroup {...buttonGroupProps}><Button href="/">Home</Button><IconButton aria-label="Options" icon={<Home />} /><Button variant="important">Confirm</Button></ButtonGroup>
      <Stack gap={3} ref={createRef<HTMLDivElement>()}><TextField label="First" /><TextField label="Second" /></Stack>
      <ActionGroup stacked ref={createRef<HTMLDivElement>()}><Button>Save</Button><Button variant="secondary">Cancel</Button></ActionGroup>
      <NavList.Item href="/" ref={createRef<HTMLAnchorElement>()}>Home</NavList.Item>
      <NavList.Item ref={createRef<HTMLButtonElement>()}>Change view</NavList.Item>
      <Pager.Next {...pagerLinkProps} target="_blank" rel="noopener" />
      <Pager.Previous href="/previous">Previous guide</Pager.Previous>
      <Icon label="Custom" viewBox="0 0 1 1"><path d="M0 0L1 1" /></Icon><BrandLogo /><BarrelHome />
      <TextField name="title" label="Title" required ref={createRef<HTMLInputElement>()} />
      <ColorPicker label="Accent color" name="accent" defaultValue="#abcdef" ref={createRef<HTMLInputElement>()} onValueChange={value => { const typed: string = value; void typed; }} />
      <Textarea label="Notes" ref={createRef<HTMLTextAreaElement>()} />
      <Checkbox label="Enabled" checked="mixed" onCheckedChange={value => { const typed: boolean = value; void typed; }} />
      <Switch label="Alerts" defaultChecked /><RadioGroup name="mode"><Radio value="one" label="One" /></RadioGroup>
      <Select options={options} name="choice" onValueChange={value => { const typed: string | null = value; void typed; }} />
      <Combobox label="Owner" items={people} onValueChange={(value, item) => { const typed: string | null = value; const chosen: ComboboxItem | null = item; void typed; void chosen; }} />
      <Combobox multiple label="Reviewers" items={[{ label: 'Team', items: people }]} filter={(item, query) => item.label.startsWith(query)} onValueChange={(values, items) => { const typed: string[] = values; const chosen: ComboboxItem[] = items; void typed; void chosen; }} ref={createRef<HTMLInputElement>()} />
      <DatePicker label="Due" withTime clearable onValueChange={value => { const typed: string | null = value; void typed; }} ref={createRef<HTMLButtonElement>()} />
      <Calendar value="2026-10-14" weekStart={1} onValueChange={value => { const typed: string = value; void typed; }} />
      <Dialog title="Confirm" trigger={<Button>Open</Button>} actions={<DialogClose>Done</DialogClose>} />
      <Toast.Provider><NotificationAction /></Toast.Provider>
    </Theme>;
    // @ts-expect-error Icon-only actions require an accessible name.
    const unnamedIconButton = <IconButton icon={<Home />} />;
    // @ts-expect-error The theme boundary has only the two owned themes.
    const unknownTheme = <Theme theme="system" />;
    // @ts-expect-error Button variants are the explicit public contract.
    const unknownButton = <Button variant="custom">Example</Button>;
    // @ts-expect-error Connected buttons support rows or columns.
    const unknownOrientation = <ButtonGroup orientation="diagonal" />;
    // @ts-expect-error Layout gap must use the defined spacing scale.
    const unknownGap = <Stack gap={10} />;
    // @ts-expect-error A pager link takes its direction from its part.
    const unknownDirection = <Pager.Next direction="up" href="/guide">Guide</Pager.Next>;
    // @ts-expect-error A pager link requires a destination URL.
    const missingDestination = <Pager.Next>Guide</Pager.Next>;
    // @ts-expect-error A multiple combobox takes a list of values.
    const singleValueForSeveral = <Combobox multiple items={people} value="first" />;
    void singleValueForSeveral;
    // @ts-expect-error A color picker requires a visible label.
    const unnamedColorPicker = <ColorPicker defaultValue="#abcdef" />;
    void unnamedColorPicker;
    void [unnamedIconButton, unknownTheme, unknownButton, unknownOrientation, unknownGap, unknownDirection, missingDestination];
  `,
  );
  await writeFile(
    join(consumerDirectory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: ['react', 'react-dom'],
        lib: ['ES2022', 'DOM'],
      },
      include: ['Consumer.tsx'],
    }),
  );
  const files = run(consumerRequire.resolve('typescript/bin/tsc'), [
    '--project',
    join(consumerDirectory, 'tsconfig.json'),
    '--listFiles',
  ]);
  const typedFiles = files.trim().split(/\r?\n/);
  assert.ok(typedFiles.length > 10, 'Typecheck the installed declarations and dependencies.');
  for (const file of typedFiles) {
    const inside = relative(consumerDirectory, resolve(consumerDirectory, file));
    assert.ok(
      !inside.startsWith('..') && !isAbsolute(inside),
      `Consumer used types outside its installation: ${file}`,
    );
  }
});

test('public components import and render on a server with no DOM globals', function () {
  assert.match(ssr.html, /aria-label="Accent color HEX"/);
  assert.match(ssr.html, /name="accent"[^>]*value="#abcdef"/);
  assert.match(ssr.html, /data-env-theme="dark"/);
  assert.match(ssr.html, /data-originating-theme="dark"/);
  assert.match(ssr.html, /class="env-button env-button-primary"/);
  assert.match(
    ssr.html,
    /aria-label="Connected actions" role="group" class="env-button-group" data-orientation="vertical"/,
  );
  assert.match(ssr.html, /<a href="\/previous-guide" rel="prev"/);
  assert.match(ssr.html, /<a href="\/next-guide" rel="next"/);
  assert.match(ssr.html, /Up next/);
  assert.match(ssr.html, /name="title"/);
  assert.match(ssr.html, /role="switch"/);
  assert.match(ssr.html, /name="mode"/);
  assert.match(
    ssr.html,
    /role="combobox"[^>]*value="First person"|value="First person"[^>]*role="combobox"/,
  );
  assert.match(ssr.html, /name="owner"[^>]*value="first"|value="first"[^>]*name="owner"/);
  assert.match(ssr.html, /<input type="hidden"[^>]*name="reviewers" value="second"/);
  assert.match(ssr.html, /Second person/);
  assert.match(ssr.html, /14 Oct 2026, 09:30/);
  assert.match(
    ssr.html,
    /name="due"[^>]*value="2026-10-14T09:30"|value="2026-10-14T09:30"[^>]*name="due"/,
  );
  assert.match(ssr.html, /role="group" aria-label="Planning"/);
  assert.match(ssr.html, /role="grid"/);
  assert.match(ssr.html, /aria-selected="true"[^>]*data-date="2026-03-09"/);
  assert.match(ssr.html, /role="status"/);
  assert.match(ssr.html, /aria-hidden="true" class="env-skeleton"/);
  assert.match(ssr.html, /aria-label="envsemble"/);
});

/** The index of the parenthesis that closes the group opening at index, or -1. */
function closingParenthesis(selector, index) {
  let depth = 0;
  for (; index < selector.length; index++) {
    if (selector[index] === '(') depth++;
    else if (selector[index] === ')' && --depth === 0) return index;
  }
  return -1;
}

/**
 * The selector without its :not() groups, which leave elements out rather than name them. A group
 * that holds another negation stays, since two negations name what they negate.
 */
function withoutNegations(selector) {
  let result = '';
  for (let index = 0; index < selector.length; index++) {
    if (selector.startsWith(':not(', index)) {
      const end = closingParenthesis(selector, index + ':not'.length);
      if (end === -1) return selector;
      const group = selector.slice(index, end + 1);
      if (group.slice(':not('.length).includes(':not(')) result += group;
      index = end;
      continue;
    }
    result += selector[index];
  }
  return result;
}

/** Whether a selector names the document element, in any case and namespace. */
function namesDocumentElement(selector) {
  return /(?:^|[\s>+~(,|])html(?![\w-])/i.test(withoutNegations(selector));
}

/** The compounds of a selector, each with the combinator before it, outside any group. */
function compounds(selector) {
  const parts = [];
  let depth = 0;
  let current = '';
  let combinator = '';
  for (const character of selector) {
    if (character === '(' || character === '[') depth++;
    else if (character === ')' || character === ']') depth--;
    if (depth === 0 && /[\s>+~]/.test(character)) {
      if (current) {
        parts.push({ combinator, compound: current });
        current = '';
        combinator = ' ';
      }
      if (!/\s/.test(character)) combinator = character;
      continue;
    }
    current += character;
  }
  if (current) parts.push({ combinator, compound: current });
  return parts;
}

/**
 * Whether the siblings a selector reaches stay envUI's: a sibling of an envUI element must carry an
 * envUI class itself, while siblings within one, after a descendant or child combinator, do.
 */
function siblingsStayScoped(selector) {
  let within = false;
  for (const { combinator, compound } of compounds(selector).slice(1)) {
    if (combinator === ' ' || combinator === '>') within = true;
    else if (!within && !/\.env-/.test(compound)) return false;
  }
  return true;
}

/**
 * A heuristic for selectors that match only envUI's elements: each starts at an envUI class, or at
 * a zero-specificity :where() around such selectors, and reaches siblings only within them or with
 * an envUI class. The document element appears only as a root that opted in with .env-theme, as one
 * compound, or in two whole selectors at zero specificity: the body of a themed root, and the
 * document element while it contains an envUI element.
 */
function scopedSelector(selector) {
  const list = splitSelectors(selector);
  if (list.length !== 1) return list.length > 1 && list.every(scopedSelector);
  const normalized = selector
    .replace(/\s*([>+~])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
  if (normalized === ':where(.env-theme:where(html) > body)') return true;
  if (
    !/[\s>+~,]/.test(normalized) &&
    /\.env-theme(?![\w-])/.test(normalized) &&
    namesDocumentElement(normalized)
  )
    return true;
  if (normalized.startsWith(':where(html:has(')) {
    const end = closingParenthesis(normalized, ':where(html:has'.length);
    // Nothing may follow, inside the :where() or after it.
    if (end === -1 || normalized.slice(end + 1) !== ')') return false;
    const inner = splitSelectors(normalized.slice(':where(html:has('.length, end));
    return inner.length > 0 && inner.every(scopedElement);
  }
  return scopedElement(normalized);
}

/**
 * A selector that starts at an envUI class, or a zero-specificity :where() around such selectors,
 * never names the document element, through which it would reach the whole page, and reaches
 * siblings only within envUI's elements or with an envUI class.
 */
function scopedElement(selector) {
  const list = splitSelectors(selector);
  if (list.length !== 1) return list.length > 1 && list.every(scopedElement);
  if (namesDocumentElement(selector) || !siblingsStayScoped(selector)) return false;
  if (/^(?:[a-zA-Z][\w-]*)?\.env-/.test(selector)) return true;
  if (!selector.startsWith(':where(')) return false;
  const end = closingParenthesis(selector, ':where'.length);
  if (end === -1) return false;
  // What follows a :where() around envUI's elements matches within them.
  const inner = splitSelectors(selector.slice(':where('.length, end));
  return inner.length > 0 && inner.every(scopedElement);
}

/** The selectors of a style sheet's rules, without comments and @ statements such as @layer a; */
function ruleSelectors(css) {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@[^{};]*;/g, '');
  return [...rules.matchAll(/(?:^|(?<=[{}]))\s*([^{}]+)\{/g)].map((match) => match[1].trim());
}

test('the CSS scope check accepts only selectors that match envUI elements', () => {
  for (const selector of [
    '.env-theme',
    'button.env-button',
    '.env-theme:where(:not(html))',
    '.env-theme:where(html)',
    'html.env-theme',
    ':where(.env-theme:where(html) > body)',
    ':where(.env-theme) .env-button',
    '.env-markdown > * + *',
    '.env-button + .env-button',
    ':where(html:has(.env-app-shell:not([data-title-bar])))',
  ])
    assert.ok(scopedSelector(selector), selector);
  for (const selector of [
    'body',
    ':root',
    ':where(body)',
    ':where(.env-theme, body)',
    ':where(.env-theme) , body',
    ':where(.env-theme',
    ':where(html:has(body))',
    ':where(html:has(.env-app-shell) body)',
    ':where(html:has(.env-app-shell)) *',
    ':where(html:has(.env-app-shell)) body',
    ':where(html:has(.env-app-shell)) p',
    ':where(html:has(.env-app-shell)) ~ div',
    ':where(:where(html:has(.env-x))) input',
    'html:has(.env-app-shell)',
    'html:has(.env-app-shell) body',
    'body:has(.env-app-shell)',
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

function splitSelectors(prelude) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < prelude.length; index++) {
    const character = prelude[index];
    if (character === '(' || character === '[') depth++;
    else if (character === ')' || character === ']') depth--;
    else if (character === ',' && depth === 0) {
      parts.push(prelude.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(prelude.slice(start).trim());
  return parts;
}

test('the package includes scoped CSS, local fonts, branding and license notices', async function () {
  const css = await readFile(fileURLToPath(ssr.css), 'utf8');
  assert.ok(/\.env-theme\s*\{/.test(css), 'Missing explicit theme boundary.');
  assert.ok(/\[data-env-theme=["']?dark["']?\]/.test(css), 'Missing dark theme boundary.');
  assert.ok(/--state-lightness-threshold:\s*50/.test(css), 'Preserve the 50% lightness threshold.');
  assert.ok(/--state-hover-shift:\s*10/.test(css), 'Preserve the 10% hover shift.');
  assert.ok(/--state-pressed-shift:\s*20/.test(css), 'Preserve the 20% press shift.');
  assert.ok(
    /--state-lightness-direction:.*sign\(l - var\(--state-lightness-threshold\)\)/.test(css),
    'Preserve the shared HSL direction rule.',
  );
  assert.ok(
    /@font-face\s*\{[^}]*font-family:\s*["']envUI Inter["']/.test(css),
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
    assert.ok(
      existsSync(resolve(dirname(fileURLToPath(ssr.css)), match[1])),
      `Missing CSS asset: ${match[1]}`,
    );
  }
  assert.equal((await readFile(fileURLToPath(ssr.font))).subarray(0, 4).toString(), 'wOF2');
  assert.match(await readFile(fileURLToPath(ssr.logo), 'utf8'), /<svg/);
  for (const filename of [
    'README.md',
    'skills/envui-use/SKILL.md',
    'skills/envui-migrate/SKILL.md',
    'THIRD_PARTY_NOTICES.md',
    'icon-manifest.json',
  ]) {
    assert.ok(
      (await readFile(join(installedDirectory, filename))).length > 0,
      `Missing packaged guidance: ${filename}`,
    );
  }
  assert.match(
    await readFile(join(installedDirectory, 'licenses/Runtime-Dependencies-LICENSE.txt'), 'utf8'),
    /react-colorful@5\.8\.1/,
  );
  for (const filename of [
    'Base-UI-LICENSE.txt',
    'Inter-LICENSE.txt',
    'Material-Symbols-LICENSE.txt',
  ]) {
    assert.ok((await readFile(join(installedDirectory, 'licenses', filename))).length > 0);
  }
});

test('explicit official icons preserve filled geometry and accept custom SVG content', async function () {
  assert.match(ssr.defaultIcon, /viewBox="0 -960 960 960"/);
  assert.match(ssr.defaultIcon, /aria-hidden="true"/);
  assert.match(ssr.defaultIcon, /d="M240-200h120v-200/);
  assert.match(ssr.filledIcon, /d="M160-200v-360/);
  assert.match(ssr.filledIcon, /role="img"/);
  assert.match(ssr.filledIcon, /aria-label="Home"/);
  assert.doesNotMatch(ssr.filledIcon, /aria-hidden="true"/);
  assert.notEqual(ssr.defaultIcon, ssr.filledIcon);
  assert.equal(ssr.defaultIcon, ssr.barrelIcon);
  assert.match(ssr.selectedNavigation, /d="M160-200v-360/);
  assert.match(ssr.unselectedNavigation, /d="M240-200h120v-200/);
  assert.match(ssr.customIcon, /viewBox="0 0 8 8"/);
  assert.match(ssr.customIcon, /aria-label="Custom star"/);
  assert.match(ssr.customIcon, /d="M0 0L8 8"/);
  assert.ok(
    (await readdir(join(installedDirectory, 'dist/icons'))).length > 100,
    'The package contains the generated catalogue.',
  );
});

test('packed skills locate separate versioned documentation and match the release sources', async function () {
  assert.equal(existsSync(join(installedDirectory, 'USAGE.md')), false);
  const packagedReadme = await readFile(join(installedDirectory, 'README.md'), 'utf8');
  assert.match(packagedReadme, /\]\(skills\/envui-use\/SKILL\.md\)/);
  assert.doesNotMatch(packagedReadme, /\]\(\.agents\/skills\//);
  // Hosting, deployment and the release runbook are for maintainers, in CONTRIBUTING.md.
  assert.doesNotMatch(packagedReadme, /^#{2,} (?:Hosting|Deploying|Releases)\b|wrangler/im);
  assert.match(
    packagedReadme,
    /\]\(https:\/\/github\.com\/envsemble\/envUI\/blob\/main\/CONTRIBUTING\.md\)/,
  );
  const readmeResources = [
    ...[...packagedReadme.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]),
    ...[...packagedReadme.matchAll(/\b(?:src|srcset)="([^"]+)"/g)].map((match) => match[1]),
  ];
  for (const target of readmeResources) {
    if (/^https?:\/\//.test(target)) continue;
    const resource = resolve(installedDirectory, target);
    const contained = relative(installedDirectory, resource);
    assert.ok(!contained.startsWith('..') && !isAbsolute(contained));
    assert.ok(
      existsSync(resource),
      `README resource is absent from the installed package: ${target}`,
    );
  }
  const skillNames = await readdir(join(installedDirectory, 'skills'));
  assert.deepEqual(skillNames.sort(), ['envui-migrate', 'envui-use']);
  for (const skillName of skillNames) {
    const skillFile = join(installedDirectory, 'skills', skillName, 'SKILL.md');
    const source = await readFile(skillFile, 'utf8');
    assert.deepEqual(await readdir(dirname(skillFile)), ['SKILL.md']);
    assert.equal(
      source,
      await readFile(join(repository, '.agents/skills', skillName, 'SKILL.md'), 'utf8'),
    );
    for (const [, target] of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const resource = resolve(dirname(skillFile), target);
      const contained = relative(join(installedDirectory, 'skills'), resource);
      assert.ok(
        !contained.startsWith('..') && !isAbsolute(contained),
        `Skill resource escapes its package: ${target}`,
      );
      assert.equal(
        await readFile(resource, 'utf8'),
        await readFile(join(repository, '.agents/skills', contained), 'utf8'),
        `Packaged skill resource differs from its maintained source: ${target}`,
      );
    }
  }
  const packagedDocumentation = readDocumentation(join(installedDirectory, 'docs'));
  assert.deepEqual(packagedDocumentation, readDocumentation());
  assert.ok(packagedDocumentation.some((document) => document.path === 'components/dialog.md'));
  assert.ok(packagedDocumentation.some((document) => document.path === 'components/rich-text.md'));
  for (const { path } of packagedDocumentation) {
    assert.equal(
      await readFile(join(installedDirectory, 'docs', path), 'utf8'),
      await readFile(join(repository, 'docs', path), 'utf8'),
      `Packaged documentation differs from its release source: ${path}`,
    );
  }
});

test('a small independent bundle excludes unused icons and Base UI', async function () {
  const result = await runConsumer(
    'BundleConsumer.mjs',
    `
    import { build } from 'esbuild';
    const result = await build({
      stdin: { contents: "export { Theme, Button, Icon } from '@envsemble/envui'; export { Home } from '@envsemble/envui/icons/Home';", resolveDir: process.cwd(), sourcefile: 'consumer.js' },
      bundle: true, write: false, format: 'esm', platform: 'browser', treeShaking: true,
      outfile: 'consumer.js', metafile: true, logLevel: 'silent',
      external: ['react', 'react/*', 'react-dom', 'react-dom/*', '@base-ui/react', '@base-ui/react/*']
    });
    const output = result.outputFiles[0];
    const meta = Object.values(result.metafile.outputs)[0];
    console.log(JSON.stringify({ code: output.text, bytes: output.contents.length,
      emittedInputs: Object.entries(meta.inputs).filter(([, value]) => value.bytesInOutput > 0).map(([path]) => path.replaceAll('\\\\', '/')) }));
  `,
  );
  const iconInputs = result.emittedInputs.filter((path) => /\/dist\/icons\//.test(path));
  assert.equal(
    iconInputs.length,
    1,
    `Unexpected icons in consumer bundle: ${iconInputs.join(', ')}`,
  );
  assert.match(iconInputs[0], /\/Home\.js$/);
  assert.ok(result.bytes < 12000, `Small consumer unexpectedly emitted ${result.bytes} bytes.`);
  assert.doesNotMatch(result.code, /@base-ui\/react|CheckCircle|ChevronRight|Warning|BrandLogo/);
  assert.ok(
    result.emittedInputs.every((path) => !path.includes('/react-colorful/')),
    'Unused color picking must stay out of basic control bundles.',
  );
  assert.ok(
    result.emittedInputs.every((path) => !path.includes('/@tiptap/')),
    'Optional Tiptap must stay out of core bundles.',
  );
  assert.ok(
    result.emittedInputs.every((path) => !path.includes('/src/')),
    'The release consumer must not resolve the development source condition.',
  );
});

test('packed rich text statically renders the shared Markdown schema and reference marks', async function () {
  const formattedSource =
    '## Heading\n\n**Bold** *italic* ~~strike~~ `code` [guide](/guide)\n\n- [x] Done\n- [ ] Open\n\n> Quote\n\n| Name | State |\n| --- | --- |\n| One | Ready |\n\n```js\nconst value = 1;\n```';
  const result = await runConsumer(
    'RichTextConsumer.mjs',
    `
    import { createElement as h } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import { RichText, RichTextEditor, createRichTextExtensions } from '@envsemble/envui/rich-text';
    import { MarkdownManager } from '@tiptap/markdown';
    const extensions = createRichTextExtensions();
    const manager = new MarkdownManager({ extensions, marked: extensions.find(extension => extension.name === 'markdown').options.marked });
    const formatted = manager.parse(${JSON.stringify(formattedSource)});
    const formattedRoundtrip = manager.parse(manager.serialize(formatted));
    const attrs = { id: 'file:[stable] "id" 🗂', label: 'Brackets [and] "quotes" & 🗂', href: '/files/stable', kind: 'arbitrary', mentionSuggestionChar: '#' };
    const document = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Before ' }, { type: 'envReference', attrs, marks: [{ type: 'bold' }] }, { type: 'text', text: ' after' }] }] };
    const markdown = manager.serialize(document);
    const roundtrip = manager.parse(markdown);
    const html = renderToStaticMarkup(h(RichText, { onReferenceClick: () => {} }, markdown));
    const unsafe = renderToStaticMarkup(h(RichText, {}, '[Unsafe](javascript:alert(1)) ![No](data:image/svg+xml,bad)'));
    const literalHtml = renderToStaticMarkup(h(RichText, {}, '<strong>raw HTML</strong>'));
    const unknown = renderToStaticMarkup(h(RichText, {}, '[reference id="ok" label="Usable" marks="%5B%7B%22type%22%3A%22unknown%22%7D%5D"]'));
    const task = renderToStaticMarkup(h(RichText, {}, '- [x] Complete task'));
    const editor = renderToStaticMarkup(h(RichTextEditor, { label: 'SSR editor', defaultValue: markdown, name: 'source' }));
    console.log(JSON.stringify({ markdown, roundtrip, html, unsafe, literalHtml, unknown, task, editor, formatted, formattedRoundtrip, module: import.meta.resolve('@envsemble/envui/rich-text') }));
  `,
  );
  const atom = result.roundtrip.content[0].content.find((node) => node.type === 'envReference');
  assert.equal(atom.attrs.id, 'file:[stable] "id" 🗂');
  assert.equal(atom.attrs.label, 'Brackets [and] "quotes" & 🗂');
  assert.equal(atom.attrs.kind, 'arbitrary');
  assert.equal(atom.attrs.mentionSuggestionChar, '#');
  assert.deepEqual(atom.marks, [{ type: 'bold' }]);
  assert.deepEqual(
    result.formattedRoundtrip,
    result.formatted,
    'Supported headings/marks/tasklists/quotes/tables/code must retain their schema on Markdown roundtrip.',
  );
  assert.match(result.html, /<strong><a[^>]*href="\/files\/stable"/);
  assert.doesNotMatch(result.unsafe, /href="javascript:|src="data:/);
  assert.match(result.literalHtml, /&lt;strong&gt;raw HTML&lt;\/strong&gt;/);
  assert.match(result.unknown, /Usable/);
  assert.match(result.task, /disabled/);
  assert.match(result.editor, /name="source"/);
  assert.match(result.module, /\/dist\/rich-text\.js$/);
});

test('avatar groups, relative times, copy buttons and pagination render on a server and type their contracts', async function () {
  const display = await runConsumer(
    'DisplayConsumer.mjs',
    `
    import { createElement as h } from 'react';
    import { renderToString } from 'react-dom/server';
    import * as ui from '@envsemble/envui';
    if (typeof document !== 'undefined' || typeof window !== 'undefined') throw new Error('DOM globals must be absent');
    const people = [{ name: 'Alex Morgan' }, { name: 'Sam Lee' }, { name: 'Priya Shah' }];
    const now = Date.parse('2026-10-14T12:00:00Z');
    const light = (element) => renderToString(h(ui.Theme, { theme: 'light' }, element));
    console.log(JSON.stringify({
      relative: light(h(ui.RelativeTime, { value: '2026-10-16T12:00:00Z', now, locale: 'en' })),
      formatted: [
        ui.formatRelativeTime(now - 3 * 3600000, { now, locale: 'en' }),
        ui.formatRelativeTime(now - 10000, { now, locale: 'en' }),
        ui.formatRelativeTime(now - 3 * 3600000, { now, locale: 'de', format: 'short' }),
        ui.formatRelativeTime('not a date', { now }),
        // An invalid now is ignored, as by RelativeTime: the text follows the clock.
        ui.formatRelativeTime(Date.now() - 3 * 3600000, { now: new Date('not a date'), locale: 'en' }),
      ],
      avatars: light(h(ui.AvatarGroup, { people, max: 2, total: 5 })),
      copy: light(h(ui.CopyButton, { value: 'Copied text', 'aria-label': 'Copy link' })),
      pagination: light(h(ui.Pagination, { page: 2, pageSize: 60, total: 245, onPageChange() {} })),
    }));
  `,
  );
  // React writes dateTime; attribute names in HTML are case-insensitive.
  assert.match(
    display.relative,
    /<time [^>]*datetime="2026-10-16T12:00:00.000Z"[^>]*>in 2 days<\/time>/i,
  );
  assert.match(display.relative, /<time dir="auto"/);
  assert.deepEqual(display.formatted, ['3 hours ago', 'just now', 'vor 3 Std.', '', '3 hours ago']);
  assert.match(
    display.avatars,
    /role="group" aria-label="5 people: Alex Morgan, Sam Lee, Priya Shah, 2 more"/,
  );
  assert.match(display.avatars, /<span dir="ltr">\+3<\/span>/);
  assert.match(display.copy, /<button[^>]*aria-label="Copy link"/);
  assert.match(display.copy, /role="status"/);
  assert.match(display.pagination, /<nav aria-label="Pagination" class="env-pagination">/);
  assert.match(display.pagination, />61–120 of 245</);

  await writeFile(
    join(consumerDirectory, 'DisplayConsumer.tsx'),
    `
    import { AvatarGroup, CopyButton, Pagination, RelativeTime, formatRelativeTime,
      type AvatarGroupPerson, type AvatarGroupProps, type CopyButtonProps, type PaginationProps,
      type PaginationRange, type RelativeTimeProps } from '@envsemble/envui';
    const person: AvatarGroupPerson = { name: 'Alex Morgan', id: 7, href: '/people/alex', src: null, fallback: 'initials' };
    const groupProps: AvatarGroupProps = { people: [person], max: 3, size: 'small', total: 12, formatMore: (count) => count + ' more' };
    const describe = (range: PaginationRange) => range.start + '–' + range.end + ' of ' + (range.total ?? 'many');
    const pagerProps: PaginationProps = { page: 1, pageSize: 10, onPageChange: (page) => { const typed: number = page; void typed; } };
    const timeProps: RelativeTimeProps = { value: new Date(), format: 'narrow', locale: ['de', 'en'], tooltip: false };
    const copyProps: CopyButtonProps = { value: () => Promise.resolve('text'), 'aria-label': 'Copy link', copyLabel: 'Copy' };
    const text: string = formatRelativeTime(Date.now(), { format: 'short', now: new Date() });
    export const display = <>
      <AvatarGroup {...groupProps} onPersonClick={(clicked, event) => { void clicked.name; event.preventDefault(); }} />
      <RelativeTime {...timeProps} nowLabel="moments ago" />
      <CopyButton {...copyProps} onCopy={(copied) => { const typed: string = copied; void typed; }} />
      <CopyButton value="text" size="compact" variant="text">Copy</CopyButton>
      <Pagination {...pagerProps} formatRange={describe} hasNextPage pending size="compact" />
    </>;
    void text;
    // @ts-expect-error An icon-only copy button requires an accessible name.
    const unnamedCopy = <CopyButton value="text" />;
    // @ts-expect-error Children that render nothing leave the button icon-only, without a name.
    const falseLabel = <CopyButton value="text">{false}</CopyButton>;
    // @ts-expect-error So does null.
    const nullLabel = <CopyButton value="text">{null}</CopyButton>;
    const namedWithoutLabel = <CopyButton value="text" aria-label="Copy">{null}</CopyButton>;
    // @ts-expect-error Avatar groups take the avatar sizes.
    const unknownSize = <AvatarGroup people={[]} size="huge" />;
    // @ts-expect-error A pager asks the application for pages.
    const inertPager = <Pagination page={1} pageSize={10} />;
    // @ts-expect-error Relative times have three formats.
    const unknownFormat = <RelativeTime value={0} format="tiny" />;
    void [unnamedCopy, falseLabel, nullLabel, namedWithoutLabel, unknownSize, inertPager, unknownFormat];
  `,
  );
  await writeFile(
    join(consumerDirectory, 'tsconfig.display.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: ['react', 'react-dom'],
        lib: ['ES2022', 'DOM'],
      },
      include: ['DisplayConsumer.tsx'],
    }),
  );
  run(consumerRequire.resolve('typescript/bin/tsc'), [
    '--project',
    join(consumerDirectory, 'tsconfig.display.json'),
  ]);
});

test('the panel dock renders its panels, chips and header on a server and types its contracts', async function () {
  const dock = await runConsumer(
    'DockConsumer.mjs',
    `
    import { createElement as h, Fragment } from 'react';
    import { renderToString } from 'react-dom/server';
    import * as ui from '@envsemble/envui';
    if (typeof document !== 'undefined' || typeof window !== 'undefined') throw new Error('DOM globals must be absent');
    const panels = [
      { id: 'notes', title: 'Notes', mode: 'open', active: true },
      { id: 'budget', title: 'Budget', mode: 'minimized', attention: 'Unsaved changes' },
    ];
    const html = renderToString(h(ui.Theme, { theme: 'light' },
      h(ui.PanelDock, { panels, onModeChange() {}, onClose() {} },
        (panel) => h(Fragment, null,
          h(ui.PanelDockHeader, { title: panel.title, meta: 'Edited today' }),
          h('p', null, 'Body of ' + panel.title)))));
    console.log(JSON.stringify({ html }));
  `,
  );
  assert.match(
    dock.html,
    /<section [^>]*aria-label="Notes"[^>]*data-panel-id="notes"[^>]*data-mode="open"/,
  );
  assert.match(dock.html, /<h2 class="env-panel-dock-title">Notes<\/h2>/);
  for (const name of ['Minimize', 'Maximize', 'Close'])
    assert.match(dock.html, new RegExp(`aria-label="${name}"`));
  // A minimized panel's content renders too, kept out of sight behind its chip.
  assert.match(dock.html, /<section [^>]*data-panel-id="budget"[^>]*data-placement="hidden"/);
  assert.match(dock.html, /Body of Budget/);
  assert.match(dock.html, /<ul class="env-panel-dock-strip" aria-label="Hidden panels">/);
  assert.match(dock.html, /aria-label="Show Budget"/);
  assert.match(dock.html, /Unsaved changes/);
  // Server output is in place before it hydrates, without an entrance.
  assert.doesNotMatch(dock.html, /data-entering/);

  await writeFile(
    join(consumerDirectory, 'DockConsumer.tsx'),
    `
    import { PanelDock, PanelDockControls, PanelDockHeader, type PanelDockMode, type PanelDockPanel,
      type PanelDockProps, type PanelDockHeaderProps, type PanelDockControlsProps } from '@envsemble/envui';
    type Document = PanelDockPanel & { body: string };
    const documents: Document[] = [
      { id: 'notes', title: 'Notes', mode: 'open', body: 'Text', height: 320, preferredWidth: 480, minWidth: 320,
        maxWidth: 640, minHeight: 240, maxHeight: 560, active: true, label: 'Notes', icon: <span />, attention: 'Unsaved', tooltip: 'Notes' },
    ];
    const headerProps: PanelDockHeaderProps = { title: 'Notes', meta: 'Edited today', headingLevel: 3 };
    const controlsProps: PanelDockControlsProps = { minimizeLabel: 'Min', maximizeLabel: 'Max', restoreLabel: 'Back', closeLabel: 'Shut' };
    const dockProps: Omit<PanelDockProps<Document>, 'children'> = {
      panels: documents,
      onModeChange: (id, mode) => { const typed: PanelDockMode = mode; void id; void typed; },
      onClose: (id) => { const typed: string = id; void typed; },
      onActivate: (id) => void id,
      onHeightChange: (id, height) => { const typed: number = height; void id; void typed; },
      stackBelow: '40rem',
      onStackedChange: (stacked) => { const typed: boolean = stacked; void typed; },
      overflow: 'minimize',
      minimizedLabel: 'Hidden panels',
      showLabel: (label) => 'Show ' + label,
      closeLabel: (label) => 'Close ' + label,
      resizeLabel: (title) => 'Resize ' + title,
    };
    export const dock = (
      <PanelDock {...dockProps}>
        {(panel) => <PanelDockHeader {...headerProps} title={panel.body} controls={<PanelDockControls {...controlsProps} />} />}
      </PanelDock>
    );
    // @ts-expect-error A dock names its chips' buttons with showLabel; restoreLabel is PanelDockControls'.
    const earlierName = <PanelDock {...dockProps} restoreLabel={(label) => 'Show ' + label}>{() => null}</PanelDock>;
    // @ts-expect-error A dock's chip labels are functions of each chip's text.
    const plainRestore = <PanelDock {...dockProps} showLabel="Show">{() => null}</PanelDock>;
    // @ts-expect-error A dock scrolls or minimizes what does not fit.
    const unknownOverflow = <PanelDock {...dockProps} overflow="hide">{() => null}</PanelDock>;
    // @ts-expect-error A panel is open, minimized or maximized.
    const unknownMode: PanelDockPanel = { id: 'notes', title: 'Notes', mode: 'closed' };
    // @ts-expect-error A dock asks the application to change modes and close panels.
    const inertDock = <PanelDock panels={documents}>{() => null}</PanelDock>;
    void [earlierName, plainRestore, unknownOverflow, unknownMode, inertDock];
  `,
  );
  await writeFile(
    join(consumerDirectory, 'tsconfig.dock.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: ['react', 'react-dom'],
        lib: ['ES2022', 'DOM'],
      },
      include: ['DockConsumer.tsx'],
    }),
  );
  run(consumerRequire.resolve('typescript/bin/tsc'), [
    '--project',
    join(consumerDirectory, 'tsconfig.dock.json'),
  ]);
});
