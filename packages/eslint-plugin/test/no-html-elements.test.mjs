import rule from '../src/rules/no-html-elements.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

/**
 * The router adapter that envUI's setup guide registers with LinkProvider, as the guide writes it,
 * when the repository has the guide.
 */
const setupGuide = new URL('../../../docs/setup.md', import.meta.url);
const routerAdapter = existsSync(setupGuide)
  ? readFileSync(setupGuide, 'utf8').match(/### Router links[\s\S]*?```tsx\n([\s\S]*?)```/)?.[1]
  : undefined;

const tail =
  " If envUI can't do what you need, propose an addition to envUI instead of a local copy.";
const icon = ', or IconButton for an icon-only button';

/** The error for an element, by the data the message is built from. */
function uses(use, found, { alternatives = '', imports = use.split('.')[0], note = '' } = {}) {
  return {
    messageId: 'useComponent',
    data: { use, found, alternatives, imports, note: note && ` ${note}` },
  };
}

const textNote = 'TextField takes the same type.';

ruleTester.run('no-html-elements', rule, {
  valid: [
    // envUI components and other components.
    '<Button onClick={save}>Save</Button>',
    '<TextField label="Name" type="email" />',
    '<Menu.Item>Rename</Menu.Item>',
    '<RouterLink to="/settings">Settings</RouterLink>',
    // Elements envUI has no component for.
    '<div className="layout"><span>Text</span></div>',
    '<ul><li>One</li></ul>',
    '<form onSubmit={submit}><label>Name</label></form>',
    // Hidden inputs carry form values, and decoys are hidden and out of the tab order.
    '<input type="hidden" name="id" value={id} />',
    '<input type="HIDDEN" name="id" />',
    '<button aria-hidden="true" tabIndex={-1} />',
    '<input aria-hidden tabIndex="-1" />',
    // Anchors without an action, and ones whose href may come from spread props.
    '<a id="top" />',
    '<a {...props} onClick={track} />',
    // Clicks on elements that are not focusable are left to accessibility linting.
    '<div onClick={() => setOpen(false)} />',
    '<li onClick={select}>One</li>',
    // A widget role on the component it names.
    '<Menu.Root role="menu" />',
    '<Dialog role="alertdialog" title="Delete?" />',
    '<Tabs role="tablist" items={items} />',
    // An envUI component that renders the role itself; a role on it refines its own.
    'import { Popover, Menu } from \'@envsemble/envui\'; <><Popover role="dialog" /><Menu.Submenu role="menu" /></>;',
    'import * as ui from \'@envsemble/envui\'; <><ui.Popover role="dialog" /><ui.Menu.Submenu role="menu" /></>;',
    'import { Popover as Card } from \'@envsemble/envui\'; <Card role="dialog" />;',
    'import { Spinner } from \'@envsemble/envui\'; <Spinner role="progressbar" label="Saving" />;',
    'import { MarkdownEditor } from \'@envsemble/envui/content\'; <MarkdownEditor role="textbox" />;',
    'import { RichTextEditor } from \'@envsemble/envui/rich-text\'; <RichTextEditor role="textbox" />;',
    // Without an import, the full name decides.
    '<Menu.Submenu role="menu" />',
    // Roles envUI has no component for, and roles that only make sense inside a container.
    '<div role="region" aria-label="Summary" />',
    '<li role="menuitem">Rename</li>',
    '<div role={role} />',
    // What a part renders in place of its own element, through the render prop.
    '<Menu.Item render={<a href="/settings" />}>Settings</Menu.Item>',
    '<Tooltip.Trigger render={<button type="button" />} />',
    '<Button render={(props) => <a {...props} href="/docs" />} />',
    '<Button render={<div><input /></div>} />',
    // Allowed by option.
    { code: '<table><tbody /></table>', options: [{ allow: ['table'] }] },
    { code: '<input type="checkbox" />', options: [{ allow: ['input'] }] },
    { code: '<input type="checkbox" />', options: [{ allow: ['input[type=checkbox]'] }] },
    { code: '<ul role="menu" />', options: [{ allow: ['[role=menu]'] }] },
    { code: '<Slot as={<button />} />', options: [{ renderProps: ['render', 'as'] }] },
  ],
  invalid: [
    {
      code: '<button onClick={save}>Save</button>',
      errors: [
        {
          message: `Use envUI's Button instead of a raw <button>, or IconButton for an icon-only button: import { Button, IconButton } from '@envsemble/envui'.${tail}`,
          line: 1,
          column: 2,
          endColumn: 8,
        },
      ],
    },
    {
      code: '<input type="email" />',
      errors: [
        {
          message: `Use envUI's TextField instead of a raw <input type="email">: import { TextField } from '@envsemble/envui'. TextField takes the same type.${tail}`,
        },
      ],
    },
    { code: '<input />', errors: [uses('TextField', 'a raw <input>', { note: textNote })] },
    {
      code: '<input type={`password`} />',
      errors: [uses('TextField', 'a raw <input type="password">', { note: textNote })],
    },
    {
      code: '<input type={kind} />',
      errors: [
        uses('TextField', 'a raw <input type={…}>', {
          note: 'For other types envUI has Checkbox, Radio, Slider, DatePicker, DropZone, ColorPicker and SearchField.',
        }),
      ],
    },
    {
      code: '<input {...field} />',
      errors: [
        uses('TextField', 'a raw <input>', {
          note: 'For other types envUI has Checkbox, Radio, Slider, DatePicker, DropZone, ColorPicker and SearchField.',
        }),
      ],
    },
    {
      code: '<input type="search" />',
      errors: [uses('SearchField', 'a raw <input type="search">')],
    },
    {
      code: '<input type="Checkbox" checked={on} />',
      errors: [
        uses('Checkbox', 'a raw <input type="Checkbox">', {
          alternatives: ', or Switch for a setting that applies at once',
          imports: 'Checkbox, Switch',
        }),
      ],
    },
    {
      code: '<input type="radio" name="size" />',
      errors: [
        uses('Radio', 'a raw <input type="radio">', {
          imports: 'Radio, RadioGroup',
          note: 'Put the radios in a RadioGroup.',
        }),
      ],
    },
    { code: '<input type="range" />', errors: [uses('Slider', 'a raw <input type="range">')] },
    { code: '<input type="date" />', errors: [uses('DatePicker', 'a raw <input type="date">')] },
    {
      code: '<input type="datetime-local" />',
      errors: [uses('DatePicker', 'a raw <input type="datetime-local">')],
    },
    { code: '<input type="file" />', errors: [uses('DropZone', 'a raw <input type="file">')] },
    { code: '<input type="color" />', errors: [uses('ColorPicker', 'a raw <input type="color">')] },
    {
      code: '<input type="submit" value="Send" />',
      errors: [
        uses('Button', 'a raw <input type="submit">', {
          note: 'Button takes type="submit" and type="reset".',
        }),
      ],
    },
    {
      code: '<select value={size}><option>S</option></select>',
      errors: [
        uses('Select', 'a raw <select>', {
          alternatives: ', or Combobox when typing filters the options',
          imports: 'Select, Combobox',
        }),
      ],
    },
    {
      code: '<textarea rows={4} />',
      errors: [
        uses('Textarea', 'a raw <textarea>', {
          alternatives: ', or Composer for writing a chat message',
          imports: 'Textarea, Composer',
        }),
      ],
    },
    { code: '<dialog open />', errors: [uses('Dialog', 'a raw <dialog>')] },
    { code: '<table><tbody /></table>', errors: [uses('Table.Root', 'a raw <table>')] },
    {
      code: '<details><summary>More</summary></details>',
      errors: [uses('Disclosure', 'a raw <details>')],
    },
    { code: '<progress value={3} max={10} />', errors: [uses('Progress', 'a raw <progress>')] },
    { code: '<meter value={0.4} />', errors: [uses('Meter', 'a raw <meter>')] },
    { code: '<kbd>⌘K</kbd>', errors: [uses('Kbd', 'a raw <kbd>')] },
    ...[
      '<a onClick={open}>Open</a>',
      '<a href="#" onClick={open} />',
      '<a href="javascript:void(0)" onClick={open} />',
    ].map((code) => ({
      code,
      errors: [
        uses('Button', 'an <a> without a destination', {
          note: 'An action is a button; give Button an href only when it navigates.',
        }),
      ],
    })),
    {
      code: '<a href="/settings">Settings</a>',
      errors: [
        uses('Link', 'a raw <a href>', {
          alternatives: ', or Button with href, for a link that looks like a button',
          imports: 'Link, Button',
          note: 'Both follow the router adapter set by LinkProvider.',
        }),
      ],
    },
    {
      code: '<div onClick={open} tabIndex={0}>Card</div>',
      errors: [
        uses('Button', 'a focusable <div> that handles clicks', {
          alternatives: icon,
          imports: 'Button, IconButton',
        }),
      ],
    },
    // Widget roles, on elements and on components that are not the component the role names.
    {
      code: '<ul role="menu"><li role="menuitem">Rename</li></ul>',
      errors: [uses('Menu.Root', '<ul role="menu">')],
    },
    { code: '<div role="menubar" />', errors: [uses('Menubar.Root', '<div role="menubar">')] },
    {
      code: '<div role="button" tabIndex={0} onClick={save} />',
      errors: [
        uses('Button', '<div role="button">', {
          alternatives: icon,
          imports: 'Button, IconButton',
        }),
      ],
    },
    {
      code: '<button role="switch" aria-checked={on} />',
      errors: [uses('Switch', '<button role="switch">')],
    },
    {
      // A component of the application's own, or of another library, is checked like an element.
      code: '<Box role="dialog" aria-modal="true" />',
      errors: [uses('Dialog', '<Box role="dialog">')],
    },
    {
      code: 'import { Text } from \'some-library\'; <Text role="alert">Saved</Text>;',
      errors: [uses('Alert', '<Text role="alert">')],
    },
    {
      code: 'function Local() { const Popover = Box; return <Popover role="dialog" />; }',
      errors: [uses('Dialog', '<Popover role="dialog">')],
    },
    // An envUI component that does not render the role: the role hand-rolls the widget on it.
    {
      code: 'import { Surface } from \'@envsemble/envui\'; <Surface role="dialog" aria-modal="true" />;',
      errors: [uses('Dialog', '<Surface role="dialog">')],
    },
    {
      code: 'import { Stack, Card } from \'@envsemble/envui\'; <Stack role="menu"><Card role="menuitem">Rename</Card></Stack>;',
      errors: [uses('Menu.Root', '<Stack role="menu">')],
    },
    {
      code: 'import * as ui from \'@envsemble/envui\'; <ui.Text role="alert">Saved</ui.Text>;',
      errors: [uses('Alert', '<ui.Text role="alert">')],
    },
    {
      code: 'import { Popover } from \'@envsemble/envui\'; <Popover role="menu" />;',
      errors: [uses('Menu.Root', '<Popover role="menu">')],
    },
    // A part of the namespace that the role names is not the component that renders it.
    {
      code: 'import { Menu } from \'@envsemble/envui\'; <><Menu.Separator role="menu" /><Menu.Item role="menu" /></>;',
      errors: [
        uses('Menu.Root', '<Menu.Separator role="menu">'),
        uses('Menu.Root', '<Menu.Item role="menu">'),
      ],
    },
    {
      code: '<><Menu.Separator role="menu" /><Menu.Item role="menu" /></>',
      errors: [
        uses('Menu.Root', '<Menu.Separator role="menu">'),
        uses('Menu.Root', '<Menu.Item role="menu">'),
      ],
    },
    // Another library's component is not envUI's, whatever its name.
    {
      code: 'import { Dialog, Button } from \'other-lib\'; <><Dialog role="dialog" /><Button role="button" /></>;',
      errors: [
        uses('Dialog', '<Dialog role="dialog">'),
        uses('Button', '<Button role="button">', {
          alternatives: icon,
          imports: 'Button, IconButton',
        }),
      ],
    },
    // The local name of an import does not make it the component of that name.
    {
      code: 'import { Surface as Dialog } from \'@envsemble/envui\'; <Dialog role="dialog" />;',
      errors: [uses('Dialog', '<Dialog role="dialog">')],
    },
    // envUI's icons are not its components.
    {
      code: 'import { Button } from \'@envsemble/envui/icons\'; <Button role="button" />;',
      errors: [
        uses('Button', '<Button role="button">', {
          alternatives: icon,
          imports: 'Button, IconButton',
        }),
      ],
    },
    // Menu items render menuitemcheckbox and menuitemradio, and a menu's radio group a group.
    {
      code: 'import { Menu } from \'@envsemble/envui\'; <><Menu.CheckboxItem role="checkbox" /><Menu.RadioItem role="radio" /><Menu.RadioGroup role="radiogroup" /></>;',
      errors: [
        uses('Checkbox', '<Menu.CheckboxItem role="checkbox">'),
        uses('Radio', '<Menu.RadioItem role="radio">', {
          imports: 'Radio, RadioGroup',
          note: 'Put the radios in a RadioGroup.',
        }),
        uses('RadioGroup', '<Menu.RadioGroup role="radiogroup">', {
          imports: 'Radio, RadioGroup',
          note: 'Give it a Radio for each option.',
        }),
      ],
    },
    { code: '<div role="tablist" />', errors: [uses('Tabs', '<div role="tablist">')] },
    { code: '<div role="tree" />', errors: [uses('Tree', '<div role="tree">')] },
    { code: '<div role="tooltip" />', errors: [uses('Tooltip', '<div role="tooltip">')] },
    {
      code: '<div role="progressbar" />',
      errors: [uses('Progress', '<div role="progressbar">')],
    },
    { code: '<div role="meter" />', errors: [uses('Meter', '<div role="meter">')] },
    { code: '<span role="link" />', errors: [uses('Link', '<span role="link">')] },
    { code: '<div role="checkbox" />', errors: [uses('Checkbox', '<div role="checkbox">')] },
    {
      code: '<div role="radiogroup" />',
      errors: [
        uses('RadioGroup', '<div role="radiogroup">', {
          imports: 'Radio, RadioGroup',
          note: 'Give it a Radio for each option.',
        }),
      ],
    },
    { code: '<div role="slider" />', errors: [uses('Slider', '<div role="slider">')] },
    {
      code: '<div role="textbox" contentEditable />',
      errors: [
        uses('TextField', '<div role="textbox">', {
          alternatives: ', or Textarea for text on several lines',
          imports: 'TextField, Textarea',
        }),
      ],
    },
    { code: '<div role="searchbox" />', errors: [uses('SearchField', '<div role="searchbox">')] },
    {
      code: '<div role="combobox" />',
      errors: [
        uses('Combobox', '<div role="combobox">', {
          alternatives: ', or Select when people pick without typing',
          imports: 'Combobox, Select',
        }),
      ],
    },
    {
      code: '<ul role="listbox" />',
      errors: [
        uses('Select', '<ul role="listbox">', {
          alternatives: ', or Combobox when typing filters the options',
          imports: 'Select, Combobox',
        }),
      ],
    },
    { code: '<div role="table" />', errors: [uses('Table.Root', '<div role="table">')] },
    // The first of several roles is the one assistive technology uses.
    {
      code: '<div role="Dialog region" />',
      errors: [uses('Dialog', '<div role="Dialog region">')],
    },
    // Allowing one entry leaves the others.
    {
      code: '<><input type="checkbox" /><input /></>',
      options: [{ allow: ['input[type=checkbox]'] }],
      errors: [uses('TextField', 'a raw <input>', { note: textNote })],
    },
    // A render prop that is not configured does not hide what it renders.
    {
      code: '<Slot as={<button />} />',
      errors: [
        uses('Button', 'a raw <button>', { alternatives: icon, imports: 'Button, IconButton' }),
      ],
    },
  ],
});

const anchor = uses('Link', 'a raw <a href>', {
  alternatives: ', or Button with href, for a link that looks like a button',
  imports: 'Link, Button',
  note: 'Both follow the router adapter set by LinkProvider.',
});

// A link adapter draws the anchor that envUI's Link would render through it again.
ruleTester.run('no-html-elements in link adapters', rule, {
  valid: [
    'function RouterLink(props) { return <a href={props.href} {...props} />; }\n<LinkProvider component={RouterLink}>{app}</LinkProvider>;',
    '<LinkProvider component={(props) => <a href={props.href} {...props} />}>{app}</LinkProvider>;',
    'const RouterLink = memo(forwardRef((props, ref) => <a ref={ref} href={props.href} />));\n<ui.LinkProvider component={RouterLink} />;',
    // An adapter kept in an object and passed as its member.
    'const adapters = { link: (props) => <a href={props.href} {...props} /> };\n<LinkProvider component={adapters.link} />;',
    "const config = { adapters: { link(props) { return <a href={props.href} />; } } };\n<LinkProvider component={config.adapters['link']} />;",
    'function RouterLink(props) { return <a href={props.href} />; }\nconst adapters = { link: RouterLink };\n<LinkProvider component={adapters.link} />;',
  ],
  invalid: [
    // An anchor elsewhere, and other raw elements inside an adapter, are still reported.
    {
      code: 'function Nav() { return <a href="/settings">Settings</a>; }\n<LinkProvider component={RouterLink} />;',
      errors: [anchor],
    },
    {
      code: 'function RouterLink(props) { return <a href={props.href}><button /></a>; }\n<LinkProvider component={RouterLink} />;',
      errors: [
        uses('Button', 'a raw <button>', { alternatives: icon, imports: 'Button, IconButton' }),
      ],
    },
    { code: '<a href="/settings">Settings</a>', errors: [anchor] },
    // Another member of the object is not the adapter.
    {
      code: 'const parts = { link: (props) => <a href={props.href} />, card: () => <a href="/card">Card</a> };\n<LinkProvider component={parts.link} />;',
      errors: [anchor],
    },
  ],
});

test("the setup guide's router adapter is in the guide", () => {
  if (existsSync(setupGuide)) assert.match(routerAdapter ?? '', /LinkComponentProps/);
});

typeScriptRuleTester.run('no-html-elements in TypeScript', rule, {
  valid: [
    'const field = <TextField<string> label="Name" />;',
    // Props typed as envUI's LinkComponentProps make a link adapter, wherever it is registered.
    ...(routerAdapter ? [routerAdapter] : []),
    'const RouterLink: ComponentType<LinkComponentProps> = ({ href, ...props }) => <a href={href} {...props} />;',
    'export const RouterLink = forwardRef<HTMLAnchorElement, envui.LinkComponentProps>((props, ref) => <a ref={ref} href={props.href} {...props} />);',
  ],
  invalid: [
    {
      code: 'export function Card({ href }: { href: string }) { return <a href={href}>Open</a>; }',
      errors: [anchor],
    },
    {
      code: 'export function Save({ onSave }: { onSave(): void }) { return <button onClick={onSave} />; }',
      errors: [
        uses('Button', 'a raw <button>', { alternatives: icon, imports: 'Button, IconButton' }),
      ],
    },
  ],
});

test('an unknown allow entry fails with the known entries', () => {
  const linter = new Linter();
  assert.throws(
    () =>
      linter.verify(
        '<buton />',
        {
          plugins: { envui: { rules: { 'no-html-elements': rule } } },
          languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
          rules: { 'envui/no-html-elements': ['error', { allow: ['buton'] }] },
        },
        'file.js',
      ),
    /unknown allow entry "buton". Known entries: \[role=button\]/,
  );
});
