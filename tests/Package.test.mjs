import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, mkdtemp, rm, lstat, readdir } from 'node:fs/promises';
import { dirname, join, resolve, relative, isAbsolute, delimiter } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

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
    throw new Error(`Consumer command failed: ${script}\n${detail}`);
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
    import { Home } from '@envsemble/envui/icons/Home';
    import { Home as BarrelHome } from '@envsemble/envui/icons';
    if (typeof document !== 'undefined' || typeof window !== 'undefined') throw new Error('DOM globals must be absent');
    function ThemeProbe() { return h('span', { 'data-originating-theme': ui.useTheme() }); }
    const custom = h(ui.Icon, { label: 'Custom star', viewBox: '0 0 8 8' }, h('path', { d: 'M0 0L8 8' }));
    const html = renderToString(h(ui.Theme, { theme: 'dark' },
      h(ThemeProbe),
      h(ui.Button, { startIcon: h(Home) }, 'Create'),
      h(ui.IconButton, { icon: custom, 'aria-label': 'Open item' }),
      h(ui.DirectionLink, { direction: 'previous', href: '/previous-guide' }, 'Earlier guide'),
      h(ui.DirectionLink, { direction: 'next', href: '/next-guide', icon: custom }, 'Following guide'),
      h(ui.Input, { name: 'title', label: 'Title', hint: 'One line', defaultValue: 'Example' }),
      h(ui.Textarea, { name: 'description', label: 'Description', defaultValue: 'Content' }),
      h(ui.Checkbox, { name: 'enabled', label: 'Enabled', defaultChecked: true }),
      h(ui.Switch, { name: 'alerts', label: 'Alerts' }),
      h(ui.RadioGroup, { name: 'mode', label: 'Mode', defaultValue: 'one' }, h(ui.Radio, { value: 'one', label: 'One' })),
      h(ui.Select, { name: 'choice', label: 'Choice', options: [{ value: 'one', label: 'One' }], defaultValue: 'one' }),
      h(ui.Dialog, { title: 'Example', open: false, trigger: h(ui.Button, null, 'Open') }),
      h(ui.ToastProvider, null, h(ui.Toast, { message: 'Saved', variant: 'success' })),
      h(ui.BrandLogo),
      h(ui.LoadingState, null, h(ui.Skeleton, { width: '38%' }))
    ));
    console.log(JSON.stringify({
      exports: Object.keys(ui), html,
      emptyDirectionLinks: renderToString(h(ui.DirectionLinks, { previous: null, next: null })),
      pairedDirectionLinks: renderToString(h(ui.DirectionLinks, {
        'aria-label': 'Guide sequence',
        previous: { href: '/before', children: 'Before', target: '_blank', rel: 'noopener' },
        next: { href: '/after', children: 'After' },
      })),
      defaultIcon: renderToString(h(Home)), filledIcon: renderToString(h(Home, { filled: true, label: 'Home' })),
      barrelIcon: renderToString(h(BarrelHome)), customIcon: renderToString(custom),
      selectedNavigation: renderToString(h(ui.NavigationItem, { selected: true, icon: h(Home, { filled: false }) }, 'Home')),
      unselectedNavigation: renderToString(h(ui.NavigationItem, { icon: h(Home, { filled: true }) }, 'Home')),
      module: import.meta.resolve('@envsemble/envui'), iconsModule: import.meta.resolve('@envsemble/envui/icons'),
      homeModule: import.meta.resolve('@envsemble/envui/icons/Home'),
      reactModule: import.meta.resolve('react'),
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

test('direction link groups omit empty navigation and preserve destination attributes', () => {
  assert.equal(ssr.emptyDirectionLinks, '');
  assert.match(ssr.pairedDirectionLinks, /<nav aria-label="Guide sequence"/);
  assert.match(ssr.pairedDirectionLinks, /href="\/before" target="_blank" rel="noopener"/);
  assert.match(ssr.pairedDirectionLinks, /href="\/after" rel="next"/);
  assert.ok(ssr.pairedDirectionLinks.indexOf('Before') < ssr.pairedDirectionLinks.indexOf('After'));
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
    'IconButton',
    'NavigationItem',
    'DirectionLink',
    'DirectionLinks',
    'Card',
    'ClickableCard',
    'Stack',
    'ActionGroup',
    'ActionCard',
    'FeatureCard',
    'GroupedRows',
    'Row',
    'InfoChip',
    'DisclosureNote',
    'EmptyState',
    'Skeleton',
    'LoadingState',
    'Input',
    'Textarea',
    'Checkbox',
    'Switch',
    'RadioGroup',
    'Radio',
    'Select',
    'Dialog',
    'DialogClose',
    'Toast',
    'ToastProvider',
    'useToast',
    'Icon',
    'BrandLogo',
  ]) {
    assert.ok(ssr.exports.includes(name), `Missing public export: ${name}`);
  }
  const installedManifest = JSON.parse(
    await readFile(join(installedDirectory, 'package.json'), 'utf8'),
  );
  assert.match(installedManifest.peerDependencies.react, /19/);
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
    import { Theme, Button, IconButton, NavigationItem, DirectionLink, Icon, BrandLogo, Input, Textarea, Checkbox, Switch, Stack, ActionGroup,
      RadioGroup, Radio, Select, Dialog, DialogClose, Toast, ToastProvider, useToast,
      type ThemeValue, type ButtonProps, type DirectionLinkProps, type SelectOption, type ToastManager } from '@envsemble/envui';
    import { Home } from '@envsemble/envui/icons/Home';
    import { Home as BarrelHome } from '@envsemble/envui/icons';
    import '@envsemble/envui/styles.css';
    const buttonProps: ButtonProps = { variant: 'important', ref: createRef<HTMLButtonElement>(), startIcon: <Home /> };
    const directionLinkProps: DirectionLinkProps = { direction: 'next', href: '/guide', children: 'Read the guide', ref: createRef<HTMLAnchorElement>(), icon: <Home /> };
    const options: SelectOption[] = [{ value: 'one', label: 'One' }];
    const theme: ThemeValue = 'dark';
    function NotificationAction() { const manager: ToastManager = useToast(); return <Button onClick={() => manager.show({ message: 'Saved' })}>Save</Button>; }
    export const consumer = <Theme theme={theme} ref={createRef<HTMLDivElement>()}>
      <Button {...buttonProps}>Create</Button><IconButton aria-label="Open" icon={<Home filled />} />
      <Stack gap={3} ref={createRef<HTMLDivElement>()}><Input label="First" /><Input label="Second" /></Stack>
      <ActionGroup stacked ref={createRef<HTMLDivElement>()}><Button>Save</Button><Button variant="secondary">Cancel</Button></ActionGroup>
      <NavigationItem href="/" ref={createRef<HTMLAnchorElement>()}>Home</NavigationItem>
      <NavigationItem ref={createRef<HTMLButtonElement>()}>Change view</NavigationItem>
      <DirectionLink {...directionLinkProps} target="_blank" rel="noopener" />
      <DirectionLink direction="previous" href="/previous">Previous guide</DirectionLink>
      <Icon label="Custom" viewBox="0 0 1 1"><path d="M0 0L1 1" /></Icon><BrandLogo /><BarrelHome />
      <Input name="title" label="Title" required ref={createRef<HTMLInputElement>()} />
      <Textarea label="Notes" ref={createRef<HTMLTextAreaElement>()} />
      <Checkbox label="Enabled" checked="mixed" onCheckedChange={value => { const typed: boolean = value; void typed; }} />
      <Switch label="Alerts" defaultChecked /><RadioGroup name="mode"><Radio value="one" label="One" /></RadioGroup>
      <Select options={options} name="choice" onValueChange={value => { const typed: string | null = value; void typed; }} />
      <Dialog title="Confirm" trigger={<Button>Open</Button>} actions={<DialogClose>Done</DialogClose>} />
      <ToastProvider><NotificationAction /><Toast message="Saved" /></ToastProvider>
    </Theme>;
    // @ts-expect-error Icon-only actions require an accessible name.
    const unnamedIconButton = <IconButton icon={<Home />} />;
    // @ts-expect-error The theme boundary has only the two owned themes.
    const unknownTheme = <Theme theme="system" />;
    // @ts-expect-error Button variants are the explicit public contract.
    const unknownButton = <Button variant="custom">Example</Button>;
    // @ts-expect-error Layout gap must use the defined spacing scale.
    const unknownGap = <Stack gap={10} />;
    // @ts-expect-error Direction links have exactly two supported directions.
    const unknownDirection = <DirectionLink direction="up" href="/guide">Guide</DirectionLink>;
    // @ts-expect-error A direction link requires a destination URL.
    const missingDestination = <DirectionLink direction="next">Guide</DirectionLink>;
    void [unnamedIconButton, unknownTheme, unknownButton, unknownGap, unknownDirection, missingDestination];
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
  assert.match(ssr.html, /data-env-theme="dark"/);
  assert.match(ssr.html, /data-originating-theme="dark"/);
  assert.match(ssr.html, /class="env-button env-button-primary"/);
  assert.match(ssr.html, /<a href="\/previous-guide" rel="prev"/);
  assert.match(ssr.html, /<a href="\/next-guide" rel="next"/);
  assert.match(ssr.html, /Up next/);
  assert.match(ssr.html, /name="title"/);
  assert.match(ssr.html, /role="switch"/);
  assert.match(ssr.html, /name="mode"/);
  assert.match(ssr.html, /role="status"/);
  assert.match(ssr.html, /aria-hidden="true" class="env-skeleton"/);
  assert.match(ssr.html, /aria-label="envsemble"/);
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
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const ruleHeaders = [...withoutComments.matchAll(/(?:^|(?<=[{}]))\s*([^{}]+)\{/g)].map((match) =>
    match[1].trim(),
  );
  assert.ok(ruleHeaders.length > 50, 'Inspect the full component stylesheet.');
  for (const header of ruleHeaders) {
    if (header.startsWith('@')) continue;
    for (const selector of splitSelectors(header)) {
      assert.match(selector, /^(?:[a-zA-Z][\w-]*)?\.env-/, `Unscoped CSS selector: ${selector}`);
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
    'USAGE.md',
    'THIRD_PARTY_NOTICES.md',
    'icon-manifest.json',
  ]) {
    assert.ok(
      (await readFile(join(installedDirectory, filename))).length > 0,
      `Missing packaged guidance: ${filename}`,
    );
  }
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
    result.emittedInputs.every((path) => !path.includes('/src/')),
    'The release consumer must not resolve the development source condition.',
  );
});
