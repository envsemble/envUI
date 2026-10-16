import { readFileSync } from 'node:fs';
import rule from '../src/rules/no-renamed-exports.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

const { modules } = JSON.parse(
  readFileSync(new URL('../src/data/renames.json', import.meta.url), 'utf8'),
);
const main = '@envsemble/envui';
const bootstrap = '@envsemble/envui/theme-bootstrap';
/** The hint the rename map gives for a removed name. */
const use = (name, source = main) => modules[source][name].use;
const renamed = (name, replacement, imports = replacement.split('.')[0], source = main) => ({
  messageId: 'renamed',
  data: { name, replacement, imports, source },
});
const internal = (name, source = main) => ({
  messageId: 'internal',
  data: { name, use: use(name, source) },
});
const pagerChoices = 'Pager.Previous for direction="previous" or Pager.Next for direction="next"';
const split = (name = 'DirectionLink') => ({
  messageId: 'split',
  data: { name, source: main, prop: 'direction', choices: pagerChoices, imports: 'Pager' },
});
const splitElement = (local, value, part) => ({
  messageId: 'splitElement',
  data: { local, prop: 'direction', value, part },
});
const namespace = (name, local, root) => ({ messageId: 'namespace', data: { name, local, root } });

ruleTester.run('no-renamed-exports', rule, {
  valid: [
    "import { Button, TextField, Alert, Menu, Table } from '@envsemble/envui';",
    "import { Menu } from '@envsemble/envui'; <Menu.Root><Menu.Item /></Menu.Root>;",
    "import { Table as T } from '@envsemble/envui'; <T.Root />;",
    // Names that exist elsewhere: an icon, another package, and a local component.
    "import { Input } from '@envsemble/envui/icons';",
    "import { Input } from 'some-form-library'; <Input />;",
    'function Menu() {} <Menu />;',
    // A namespace import's other members, and a Root part reached through it.
    "import * as envui from '@envsemble/envui'; envui.Button; <envui.Menu.Root />; const M = envui.Menu;",
    // 1.0 reuses the manual Toast's name for the namespace of Toast.Provider.
    "import { Toast, useToast } from '@envsemble/envui'; <Toast.Provider>{children}</Toast.Provider>;",
    "import * as envui from '@envsemble/envui'; <envui.Toast.Provider />; envui.Toast.Provider;",
    "export { TextField } from '@envsemble/envui';",
    "export { Input } from './Input.js';",
    // A local that shadows an import or a namespace import is not envUI's.
    "import { Menu } from '@envsemble/envui'; function Local() { const Menu = 'li'; return <Menu />; }",
    "import * as envui from '@envsemble/envui'; function read(envui) { return [envui.Input, <envui.Menu />]; }",
    "import { Toast } from '@envsemble/envui'; const render = (Toast) => <Toast />;",
    // New names through require(), import() and a destructured module object.
    "const { Button, Menu } = require('@envsemble/envui'); <Menu.Root />;",
    "import('@envsemble/envui').then(({ TextField }) => TextField);",
    "import * as envui from '@envsemble/envui'; const { Alert, Menu } = envui; <Menu.Root />;",
    // createElement of the 1.0 parts.
    "import { Menu, Toast } from '@envsemble/envui'; createElement(Menu.Root); React.createElement(Toast.Provider, null);",
  ],
  invalid: [
    {
      code: "import { Input } from '@envsemble/envui';",
      errors: [
        {
          message:
            "Input is not exported by envUI 1.0: use TextField instead (import { TextField } from '@envsemble/envui'). The v1-names codemod in @envsemble/envui-codemods rewrites the old names.",
          line: 1,
          column: 10,
          endColumn: 15,
        },
      ],
    },
    {
      code: "import { Notice, DisclosureNote as Note, Button } from '@envsemble/envui';",
      errors: [renamed('Notice', 'Alert'), renamed('DisclosureNote', 'Disclosure')],
    },
    {
      code: "import { Menu, MenuItem, MenuSeparator } from '@envsemble/envui';",
      errors: [renamed('MenuItem', 'Menu.Item'), renamed('MenuSeparator', 'Menu.Separator')],
    },
    {
      code: "import { GroupedRows, Row } from '@envsemble/envui';",
      errors: [renamed('GroupedRows', 'List.Root'), renamed('Row', 'List.Item')],
    },
    {
      code: "import { DirectionLink } from '@envsemble/envui';",
      errors: [
        {
          message:
            'DirectionLink is not exported by envUI 1.0: use Pager.Previous for direction="previous" or Pager.Next for direction="next" instead, without the direction prop (import { Pager } from \'@envsemble/envui\'). The v1-names codemod in @envsemble/envui-codemods rewrites the old names.',
        },
      ],
    },
    // Each rendered DirectionLink is told the part its direction chooses.
    {
      code: 'import { DirectionLink } from \'@envsemble/envui\'; <><DirectionLink direction="previous" href="/1" /><DirectionLink direction={\'next\'} href="/3" /></>;',
      errors: [
        split(),
        {
          message:
            '<DirectionLink direction="previous"> is Pager.Previous in envUI 1.0: render <Pager.Previous> without the direction prop.',
        },
        splitElement('DirectionLink', 'next', 'Pager.Next'),
      ],
    },
    {
      code: "import { DirectionLink as Step } from '@envsemble/envui'; <Step direction={direction} />;",
      errors: [
        split(),
        {
          message:
            '<Step> is one of several parts in envUI 1.0, chosen by its direction: render Pager.Previous for direction="previous" or Pager.Next for direction="next", without the direction prop.',
        },
      ],
    },
    {
      code: "import { NavigationItem, OrganizationMenu, ToastProvider } from '@envsemble/envui';",
      errors: [
        renamed('NavigationItem', 'NavList.Item'),
        renamed('OrganizationMenu', 'OrganizationSwitcher'),
        renamed('ToastProvider', 'Toast.Provider'),
      ],
    },
    {
      code: "import { LoadingBar, getInitials } from '@envsemble/envui';",
      errors: [
        {
          message:
            "LoadingBar is internal in envUI 1.0 and no longer exported. AppShell's loading and loadingLabel props show page progress along the bottom of its topbar; Progress shows the progress of a task.",
        },
        internal('getInitials'),
      ],
    },
    {
      code: "import { defaultThemeStorageKey } from '@envsemble/envui/theme-bootstrap';",
      errors: [internal('defaultThemeStorageKey', bootstrap)],
    },
    {
      code: "export { Heatmap, Button } from '@envsemble/envui';",
      errors: [renamed('Heatmap', 'CalendarHeatmap')],
    },
    // A name that became a namespace stays importable, but is no longer a component.
    {
      code: "import { Menu } from '@envsemble/envui'; <Menu trigger={<Button />} />;",
      errors: [
        {
          message:
            'In envUI 1.0 Menu is a namespace of parts, not a component: render <Menu.Root> instead, and its other parts as Menu.*.',
          line: 1,
          column: 43,
        },
      ],
    },
    {
      code: "import { Table as DataTable, Stat } from '@envsemble/envui'; <><DataTable /><Stat /></>;",
      errors: [
        namespace('Table', 'DataTable', 'DataTable.Root'),
        namespace('Stat', 'Stat', 'Stat.Root'),
      ],
    },
    // The manual Toast is internal: rendering it is reported with what to do instead.
    {
      code: 'import { Toast } from \'@envsemble/envui\'; <Toast title="Saved" />;',
      errors: [
        {
          message:
            'In envUI 1.0 Toast is a namespace, not the 0.x component, which is internal. Show notifications through useToast() inside Toast.Provider. The manual Toast is internal; the `Toast` export is now the namespace of Toast.Provider.',
          column: 44,
        },
      ],
    },
    // Members of a namespace import.
    {
      code: "import * as envui from '@envsemble/envui'; <envui.Input />; envui.Counter; <envui.Menubar />;",
      errors: [
        renamed('Input', 'TextField'),
        renamed('Counter', 'CounterBadge'),
        namespace('Menubar', 'envui.Menubar', 'envui.Menubar.Root'),
      ],
    },
    {
      code: 'import * as envui from \'@envsemble/envui\'; <><envui.DirectionLink direction="next" /><envui.Toast /></>;',
      errors: [
        splitElement('envui.DirectionLink', 'next', 'envui.Pager.Next'),
        {
          messageId: 'reusedNamespace',
          data: { name: 'Toast', use: use('Toast') },
        },
      ],
    },
    // require(), import() and module objects bound or destructured from them.
    {
      code: "const { Input, LoadingBar: Bar } = require('@envsemble/envui');",
      errors: [{ ...renamed('Input', 'TextField'), line: 1, column: 9 }, internal('LoadingBar')],
    },
    {
      code: "const envui = require('@envsemble/envui'); envui.Notice; require('@envsemble/envui').Counter;",
      errors: [renamed('Notice', 'Alert'), renamed('Counter', 'CounterBadge')],
    },
    {
      code: "async function load() { const { Input } = await import('@envsemble/envui'); const ui = await import('@envsemble/envui'); return [Input, ui.Row, (await import('@envsemble/envui')).getInitials]; }",
      errors: [
        renamed('Input', 'TextField'),
        renamed('Row', 'List.Item', 'List'),
        internal('getInitials'),
      ],
    },
    {
      code: "import('@envsemble/envui').then(({ Notice }) => Notice); import('@envsemble/envui').then((ui) => ui.Heatmap);",
      errors: [renamed('Notice', 'Alert'), renamed('Heatmap', 'CalendarHeatmap')],
    },
    {
      code: "import * as envui from '@envsemble/envui'; const { Input, Menu } = envui; <Menu />;",
      errors: [renamed('Input', 'TextField'), namespace('Menu', 'Menu', 'Menu.Root')],
    },
    // Components created without JSX.
    {
      code: "import { Menu, Toast, DirectionLink } from '@envsemble/envui'; createElement(Menu, null); React.createElement(Toast, {}); jsx(DirectionLink, { direction: 'next' });",
      errors: [
        split(),
        namespace('Menu', 'Menu', 'Menu.Root'),
        { messageId: 'reusedNamespace', data: { name: 'Toast', use: use('Toast') } },
        splitElement('DirectionLink', 'next', 'Pager.Next'),
      ],
    },
    {
      code: "import * as envui from '@envsemble/envui'; createElement(envui.Table, { rows });",
      errors: [namespace('Table', 'envui.Table', 'envui.Table.Root')],
    },
  ],
});

typeScriptRuleTester.run('no-renamed-exports in TypeScript', rule, {
  valid: [
    "import type { TextFieldProps } from '@envsemble/envui';",
    "import type * as envui from '@envsemble/envui'; type P = envui.ButtonProps;",
    "type P = import('@envsemble/envui').TextFieldProps; type M = typeof import('@envsemble/envui').Menu.Item;",
    "type P = import('@envsemble/envui/icons').Input;",
  ],
  invalid: [
    {
      code: "type P = import('@envsemble/envui').InputProps; type T = typeof import('@envsemble/envui').LoadingBar;",
      errors: [{ ...renamed('InputProps', 'TextFieldProps'), column: 37 }, internal('LoadingBar')],
    },
    {
      code: "import type { ToastProps } from '@envsemble/envui';",
      errors: [
        {
          message:
            'ToastProps is internal in envUI 1.0 and no longer exported. Describe a notification with ToastNotification, the argument of useToast().show().',
        },
      ],
    },
    {
      code: "import type { InputProps, MenuItemProps } from '@envsemble/envui';",
      errors: [
        renamed('InputProps', 'TextFieldProps'),
        renamed('MenuItemProps', 'Menu.ItemProps', 'Menu'),
      ],
    },
    {
      code: "import { type NoticeTone, Button } from '@envsemble/envui';",
      errors: [renamed('NoticeTone', 'AlertTone')],
    },
    {
      code: "import type * as envui from '@envsemble/envui'; type P = envui.TableRowProps;",
      errors: [renamed('TableRowProps', 'Table.RowProps', 'Table')],
    },
  ],
});
