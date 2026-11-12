// How an application resolves the packed package: its compiled entry points and their exports, its
// own React, the declarations a strict TypeScript consumer reads, and what a bundler takes of it.
import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { existsSync } from 'node:fs';
import { lstat, readFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { installTimeout, packedConsumer } from '../../support/PackedConsumer.ts';

let consumer;
before(async () => (consumer = await packedConsumer()), { timeout: installTimeout });

/** envUI's cascade layers, in their order. */
const envLayers = ['env.reset', 'env.tokens', 'env.base', 'env.components', 'env.utilities'];

/**
 * The cascade layers a style sheet names, in the order they first appear, which is their order: a
 * bundler may merge blocks of a layer or drop a statement that repeats an order already set.
 */
function layerOrder(css) {
  const names = [];
  for (const [, list] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/@layer\s+([^{;]+)[{;]/g))
    for (const name of list.split(',').map((part) => part.trim()))
      if (!names.includes(name)) names.push(name);
  return names;
}

test('a packed consumer resolves compiled public exports and its own React installation', async () => {
  const resolved = await consumer.runScript(
    'ResolutionConsumer.mjs',
    `
    import * as ui from '@envsemble/envui';
    import * as color from '@envsemble/envui/color';
    import '@envsemble/envui/theme-bootstrap';
    console.log(JSON.stringify({
      exports: Object.keys(ui), colorExports: Object.keys(color),
      module: import.meta.resolve('@envsemble/envui'),
      iconsBarrel: (() => { try { return import.meta.resolve('@envsemble/envui/icons'); } catch { return null; } })(),
      homeModule: import.meta.resolve('@envsemble/envui/icons/Home'),
      reactModule: import.meta.resolve('react'),
    }));
  `,
  );
  assert.equal((await lstat(consumer.installedDirectory)).isSymbolicLink(), false);
  assert.match(resolved.module, /\/node_modules\/@envsemble\/envui\/dist\/index\.js$/);
  // Icons are imported one by one: there is no barrel of them all.
  assert.equal(resolved.iconsBarrel, null);
  assert.match(resolved.homeModule, /\/dist\/icons\/Home\.js$/);
  assert.match(resolved.reactModule, /\/consumer\/node_modules\/react\/index\.js$/);
  assert.equal(existsSync(join(consumer.installedDirectory, 'src')), false);
  for (const name of [
    'Theme',
    'useTheme',
    'Button',
    'ButtonGroup',
    'IconButton',
    'NavigationBar',
    'NavigationRail',
    'NavigationDrawer',
    'Pager',
    'Card',
    'Row',
    'Column',
    'Grid',
    'Box',
    'List',
    'Disclosure',
    'Accordion',
    'placeholders',
    'isPlaceholder',
    'useSkeleton',
    'Spinner',
    'TextField',
    'Textarea',
    'Checkbox',
    'Switch',
    'RadioGroup',
    'Radio',
    'Select',
    'Combobox',
    'DatePicker',
    'TimePicker',
    'MonthPicker',
    'Calendar',
    'Dialog',
    'DialogClose',
    'ToastProvider',
    'useToast',
    'Icon',
    'DropZone',
    'Alert',
    'Badge',
    'DiffStat',
    'CalendarHeatmap',
    'Menu',
    'ContextMenu',
    'Menubar',
    'Table',
  ]) {
    assert.ok(resolved.exports.includes(name), `Missing public export: ${name}`);
  }
  const installedManifest = JSON.parse(
    await readFile(join(consumer.installedDirectory, 'package.json'), 'utf8'),
  );
  assert.match(installedManifest.peerDependencies.react, /19/);
  // ColorPicker, ColorPickerButton and ColorSwatch come from the color entry alone, on React Aria.
  assert.deepEqual(resolved.colorExports.sort(), [
    'ColorPicker',
    'ColorPickerButton',
    'ColorSwatch',
  ]);
  for (const name of ['ColorPicker', 'ColorSwatch'])
    assert.ok(!resolved.exports.includes(name), `The main entry no longer exports ${name}`);
  assert.equal(installedManifest.dependencies['react-colorful'], undefined);
  assert.equal(installedManifest.exports['./color'].import, './dist/color.js');
  // Basic UI installs without the code, markdown, rich-text, diff and color stacks; apps using those entries add
  // them. They aren't peers either, as npm installs every peer the registry doesn't mark optional.
  assert.deepEqual(Object.keys(installedManifest.dependencies), ['@base-ui/react']);
  assert.deepEqual(Object.keys(installedManifest.peerDependencies).sort(), ['react', 'react-dom']);
  assert.match(
    JSON.parse(await readFile(consumer.require.resolve('react/package.json'), 'utf8')).version,
    /^19\./,
  );
});

test('a packed consumer imports the dev entry, which types its readout and does nothing on a server', async () => {
  const dev = await consumer.runScript(
    'DevConsumer.mjs',
    `
    import * as dev from '@envsemble/envui/dev';
    const handle = dev.installDevMode();
    await handle.ready;
    handle.open();
    handle.uninstall();
    console.log(JSON.stringify({
      exports: Object.keys(dev).sort(),
      module: import.meta.resolve('@envsemble/envui/dev'),
      same: handle.layout === dev.layout,
      layout: Object.keys(dev.layout).sort(),
    }));
  `,
  );
  assert.deepEqual(dev.exports, ['installDevMode', 'layout']);
  assert.match(dev.module, /\/node_modules\/@envsemble\/envui\/dist\/dev\.js$/);
  assert.equal(dev.same, true);
  assert.deepEqual(dev.layout, ['at', 'check', 'describe', 'skeletonShift']);
  assert.ok(
    consumer.packedFiles.includes('docs/generated/parts.json'),
    'Dev mode reads parts.json.',
  );

  await consumer.typecheck(
    'DevConsumer',
    `
    import { installDevMode, layout, type DevModeHandle, type LayoutAtResult, type LayoutProblem, type PartsFile } from '@envsemble/envui/dev';
    const parts: PartsFile = { schemaVersion: 1, components: {} };
    const handle: DevModeHandle = installDevMode({ parts, root: '#app', button: false, shortcut: false });
    const results: LayoutAtResult[] = layout.at(['22rem', 960]);
    const problems: LayoutProblem[] = window.envui?.layout?.check() ?? [];
    // @ts-expect-error at() takes px numbers or lengths, not options.
    layout.at({ width: '40rem' });
    void [handle, results, problems];
  `,
  );
});

test('installed declarations typecheck a React 19 consumer without source aliases', async () => {
  const typedFiles = await consumer.typecheck(
    'Consumer',
    `
    import { createRef } from 'react';
    import { Theme, Button, ButtonGroup, ConfirmButton, IconButton, NavigationBar, NavigationRail, NavigationDrawer, Pager, Icon, TextField, Textarea, Checkbox, Switch, Row, Column,
      EnvUIProvider, Toolbar, Field, RadioGroup, Radio, Select, Combobox, DatePicker, Calendar, Dialog, DialogClose, ToastProvider, useToast,
      type ColorScheme, type ButtonProps, type ButtonGroupProps, type SelectItem, type ComboboxItem, type ToastManager } from '@envsemble/envui';
    import { IconHome } from '@envsemble/envui/icons/Home';
    import '@envsemble/envui/styles.css';
    import { RichText, RichTextEditor, type RichTextEditorHandle, type RichTextReferenceSource } from '@envsemble/envui/rich-text';
    import { ColorPicker, ColorPickerButton, ColorSwatch, type Color, type ColorValue } from '@envsemble/envui/color';
    const colorValue: ColorValue = 'hsl(256, 34%, 48%)';
    const advanced = (color: Color): ColorValue => color.withChannelValue('alpha', 0.5);
    void advanced;
    const buttonProps: ButtonProps = { variant: 'primary', tone: 'accent', ref: createRef<HTMLButtonElement>(), startIcon: <IconHome /> };
    const buttonGroupProps: ButtonGroupProps = { orientation: 'vertical', ref: createRef<HTMLDivElement>(), 'aria-label': 'Actions' };
    const pagerLinkProps: Pager.LinkProps = { href: '/guide', children: 'Read the guide', ref: createRef<HTMLAnchorElement>(), icon: <IconHome /> };
    const options: SelectItem[] = [{ value: 'one', label: 'One' }];
    const people: ComboboxItem[] = [{ value: 'first', label: 'First person', description: 'first@example.com', start: <IconHome /> }];
    const theme: ColorScheme = 'dark';
    const referenceSources: RichTextReferenceSource[] = [{ trigger: '@', search: async ({ query, signal }) => signal.aborted ? [] : [{ id: query, label: query }] }];
    const richTextConsumer = <><RichTextEditor editorRef={createRef<RichTextEditorHandle>()} value="Notes" references={referenceSources} onValueChange={markdown => { const typed: string = markdown; void typed; }} onUpload={async (file, { signal }) => signal.aborted ? null : ({ url: '/uploads/example', label: file.name, id: 'stable-file-id', kind: 'file' })} /><RichText onReferenceClick={(reference, event) => { event.preventDefault(); void reference.id; }}>Notes</RichText></>;
    void richTextConsumer;
    function NotificationAction() { const manager: ToastManager = useToast(); return <Button onClick={() => manager.show({ message: 'Saved' })}>Save</Button>; }
    export const consumer = <Theme theme={theme} ref={createRef<HTMLDivElement>()}>
      <Button {...buttonProps}>Create</Button><IconButton aria-label="Open" icon={<IconHome filled />} />
      <ConfirmButton variant="ghost" icon={<IconHome />} aria-label="Remove" confirmLabel="Remove" onConfirm={() => undefined} />
      <ButtonGroup {...buttonGroupProps}><Button href="/">Home</Button><IconButton aria-label="Options" icon={<IconHome />} /><Button variant="primary" tone="accent">Confirm</Button></ButtonGroup>
      <Column gap={3} ref={createRef<HTMLDivElement>()}><TextField label="First" /><TextField label="Second" /></Column>
      <Row wrap justify="end" ref={createRef<HTMLDivElement>()}><Button fullWidth>Save</Button><Button variant="outline" tone="danger">Cancel</Button></Row>
      <EnvUIProvider locale="de-CH" dir="ltr" messages={{ combobox: { clear: 'Leeren' }, toast: { hidden: ({ count }) => count + ' hidden' } }}><IconButton ref={createRef<HTMLButtonElement>()} aria-label="Schließen" icon={<IconHome />} /></EnvUIProvider>
      <Toolbar.Root aria-label="Formatting"><Toolbar.Button icon={<IconHome />} label="Home" pressed shortcut="Ctrl+H" /><Toolbar.Separator /><Toolbar.Link href="/" icon={<IconHome />} label="Home" /></Toolbar.Root>
      <Field.Root name="project" invalid><Field.Label>Project</Field.Label><Field.Control size="sm" /><Field.Description>Shown to everyone</Field.Description><Field.Error>Enter a name</Field.Error></Field.Root>
      <NavigationBar ref={createRef<HTMLElement>()} destinations={[{ label: 'Home', icon: <IconHome />, href: '/', current: true }, { label: 'View', icon: <IconHome />, onClick: () => undefined, count: 2 }]} />
      <NavigationRail aria-label="Places" destinations={[{ label: 'Home', icon: <IconHome />, href: '/' }]} header={<IconHome />} />
      <NavigationDrawer destinations={[{ label: 'Guide', href: '/guide', group: 'Help' }]} footer={<IconHome />} />
      <Pager.Next {...pagerLinkProps} target="_blank" rel="noopener" />
      <Pager.Previous href="/previous">Previous guide</Pager.Previous>
      <Icon label="Custom" viewBox="0 0 1 1"><path d="M0 0L1 1" /></Icon>
      <TextField name="title" label="Title" required ref={createRef<HTMLInputElement>()} />
      <ColorPicker label="Accent color" name="accent" defaultValue="#abcdef" formats={['hex', 'rgb']} alpha ref={createRef<HTMLDivElement>()} onValueChange={(value) => { const typed: string = value; void typed; }} />
      <ColorPickerButton label="Border color" value={colorValue} valueFormat="hsl" swatches={['#abcdef', { color: colorValue, label: 'Current' }]} />
      <ColorSwatch color="#abcdef" format="hex" size="sm" label="Accent" />
      <Textarea label="Notes" ref={createRef<HTMLTextAreaElement>()} />
      <Checkbox label="Enabled" checked="mixed" onCheckedChange={value => { const typed: boolean = value; void typed; }} />
      <Switch label="Alerts" defaultChecked /><RadioGroup name="mode"><Radio value="one" label="One" /></RadioGroup>
      <Select items={options} name="choice" onValueChange={value => { const typed: string | null = value; void typed; }} />
      <Combobox label="Owner" items={people} onValueChange={(value, item) => { const typed: string | null = value; const chosen: ComboboxItem | null = item; void typed; void chosen; }} />
      <Combobox multiple label="Reviewers" items={[{ label: 'Team', items: people }]} filter={(item, query) => item.label.startsWith(query)} onValueChange={(values, items) => { const typed: string[] = values; const chosen: ComboboxItem[] = items; void typed; void chosen; }} ref={createRef<HTMLInputElement>()} />
      <DatePicker label="Due" granularity="minute" clearable onValueChange={value => { const typed: string | null = value; void typed; }} ref={createRef<HTMLButtonElement>()} />
      <Calendar value="2026-10-14" weekStart={1} onValueChange={value => { const typed: string = value; void typed; }} />
      <Dialog title="Confirm" trigger={<Button>Open</Button>} actions={<DialogClose>Done</DialogClose>} />
      <ToastProvider><NotificationAction /></ToastProvider>
    </Theme>;
    // @ts-expect-error Icon-only actions require an accessible name.
    const unnamedIconButton = <IconButton icon={<IconHome />} />;
    // @ts-expect-error The theme boundary has only the two owned themes.
    const unknownTheme = <Theme theme="system" />;
    // @ts-expect-error Button variants are the explicit public contract.
    const unknownButton = <Button variant="custom">Example</Button>;
    // @ts-expect-error A secondary button has no danger tone: tones come in designed pairs.
    const undesignedTone = <Button variant="secondary" tone="danger">Example</Button>;
    // @ts-expect-error Connected buttons support rows or columns.
    const unknownOrientation = <ButtonGroup orientation="diagonal" />;
    // @ts-expect-error Layout gap must use the defined spacing scale.
    const unknownGap = <Row gap={10} />;
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
    void [unnamedIconButton, unknownTheme, unknownButton, undesignedTone, unknownOrientation, unknownGap, unknownDirection, missingDestination];
  `,
    // A bundler's types declare the style sheet's import, as Vite's do in an application.
    { types: ['react', 'react-dom', 'vite/client'] },
  );
  assert.ok(typedFiles.length > 10, 'Typecheck the installed declarations and dependencies.');
  for (const file of typedFiles) {
    const inside = relative(consumer.directory, resolve(consumer.directory, file));
    assert.ok(
      !inside.startsWith('..') && !isAbsolute(inside),
      `Consumer used types outside its installation: ${file}`,
    );
  }
});

test('a small independent bundle excludes unused icons and Base UI', async () => {
  const result = await consumer.runScript(
    'BundleConsumer.mjs',
    `
    import { build } from 'esbuild';
    const result = await build({
      stdin: { contents: "export { Theme, Button, Icon } from '@envsemble/envui'; export { IconHome } from '@envsemble/envui/icons/Home';", resolveDir: process.cwd(), sourcefile: 'consumer.js' },
      bundle: true, write: false, format: 'esm', platform: 'browser', treeShaking: true,
      outfile: 'consumer.js', metafile: true, logLevel: 'silent',
      loader: { '.woff2': 'file', '.svg': 'file' },
      external: ['react', 'react/*', 'react-dom', 'react-dom/*', '@base-ui/react', '@base-ui/react/*']
    });
    const output = result.outputFiles.find((file) => file.path.endsWith('.js'));
    const css = result.outputFiles.find((file) => file.path.endsWith('.css'));
    const meta = Object.entries(result.metafile.outputs).find(([path]) => path.endsWith('consumer.js'))[1];
    console.log(JSON.stringify({ code: output.text, css: css.text,
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
  // Its size is held by tests/library/package/SizeBudgets.test.ts (Theme + Button + Icon, minified).
  assert.doesNotMatch(result.code, /@base-ui\/react|CheckCircle|ChevronRight|Warning/);
  assert.ok(
    result.emittedInputs.every(
      (path) => !path.includes('/color/') && !path.includes('/@react-aria/'),
    ),
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
  // esbuild bundles the style sheets the modules import, the base first with the layer order. It
  // keeps those of the modules it shakes out too, so the CSS isn't any smaller than styles.css.
  assert.deepEqual(layerOrder(result.css), envLayers);
  assert.match(result.css, /--env-color-bg-primary-emphasis-hover:/);
  assert.match(result.css, /\.env-button\s*\{/);
  assert.match(result.css, /@font-face\s*\{\s*font-family:\s*"?envUI Geist/);
});

test('a Vite application loads the style sheets of the components it uses, and renders on a server', async () => {
  const result = await consumer.runScript(
    'ViteConsumer.mjs',
    `
    import { build } from 'vite';
    import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
    import { join } from 'node:path';
    import { pathToFileURL } from 'node:url';
    const root = join(process.cwd(), 'vite-app');
    await mkdir(root, { recursive: true });
    await writeFile(join(root, 'index.html'), '<div id="root"></div><script type="module" src="./main.js"></script>');
    const app = "import { createElement as h } from 'react'; import { Theme, Button } from '@envsemble/envui'; export const App = () => h(Theme, null, h(Button, null, 'Save'));";
    await writeFile(join(root, 'App.js'), app);
    await writeFile(join(root, 'main.js'), "import { createElement as h } from 'react'; import { createRoot } from 'react-dom/client'; import { App } from './App.js'; createRoot(document.getElementById('root')).render(h(App));");
    await writeFile(join(root, 'server.js'), "import { createElement as h } from 'react'; import { renderToString } from 'react-dom/server'; import { App } from './App.js'; export const render = () => renderToString(h(App));");
    const quiet = { root, logLevel: 'silent', configFile: false };
    await build({ ...quiet, build: { outDir: 'client' } });
    const assets = join(root, 'client/assets');
    const css = (await Promise.all((await readdir(assets)).filter((file) => file.endsWith('.css')).map((file) => readFile(join(assets, file), 'utf8')))).join('');
    // The server build twice: envUI left to Node, as Vite does with dependencies by default, and
    // bundled into the server's code.
    const html = {};
    for (const [name, noExternal] of [['external', []], ['bundled', ['@envsemble/envui']]]) {
      await build({ ...quiet, ssr: { noExternal }, build: { ssr: 'server.js', outDir: 'server-' + name } });
      const { render } = await import(pathToFileURL(join(root, 'server-' + name, 'server.js')).href);
      html[name] = render();
    }
    console.log(JSON.stringify({ css, html }));
  `,
  );
  // The client's CSS: the base, with the layer order first, and Button's, and no other component's.
  assert.deepEqual(layerOrder(result.css), envLayers);
  assert.match(result.css, /--env-color-bg-primary-emphasis-hover:/);
  assert.match(result.css, /\.env-button\s*\{/);
  assert.match(result.css, /@font-face\s*\{\s*font-family:\s*"?envUI Geist/);
  for (const other of ['card', 'menu', 'text-field', 'dialog', 'tooltip', 'table', 'toast'])
    assert.doesNotMatch(result.css, new RegExp(`\\.env-${other}\\b`), `${other}'s style sheet`);
  for (const html of Object.values(result.html)) assert.match(html, /class="env-button"/);
});
