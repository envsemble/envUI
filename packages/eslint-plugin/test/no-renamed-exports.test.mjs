import rule from '../src/rules/no-renamed-exports.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

const main = '@envsemble/envui';
const renamed = (name, replacement, imports = replacement.split('.')[0], source = main) => ({
  messageId: 'renamed',
  data: { name, replacement, imports, source },
});
const internal = (name) => ({ messageId: 'internal', data: { name } });
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
    "export { TextField } from '@envsemble/envui';",
    "export { Input } from './Input.js';",
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
      errors: [renamed('DirectionLink', 'Pager.Previous or Pager.Next', 'Pager')],
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
            'LoadingBar is internal in envUI 1.0 and no longer exported. If you need what it did, propose it as public envUI API rather than copying it.',
        },
        internal('getInitials'),
      ],
    },
    {
      code: "import { defaultThemeStorageKey } from '@envsemble/envui/theme-bootstrap';",
      errors: [internal('defaultThemeStorageKey')],
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
    // Members of a namespace import.
    {
      code: "import * as envui from '@envsemble/envui'; <envui.Input />; envui.Counter; <envui.Menubar />;",
      errors: [
        renamed('Input', 'TextField'),
        renamed('Counter', 'CounterBadge'),
        namespace('Menubar', 'envui.Menubar', 'envui.Menubar.Root'),
      ],
    },
  ],
});

typeScriptRuleTester.run('no-renamed-exports in TypeScript', rule, {
  valid: [
    "import type { TextFieldProps } from '@envsemble/envui';",
    "import type * as envui from '@envsemble/envui'; type P = envui.ButtonProps;",
  ],
  invalid: [
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
