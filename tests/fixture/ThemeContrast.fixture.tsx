import { useState } from 'react';
import {
  Button,
  Combobox,
  CommandPalette,
  ContextMenu,
  DatePicker,
  Dialog,
  HoverCard,
  Link,
  Menu,
  Menubar,
  Popover,
  Select,
  Text,
  Theme,
  ToastProvider,
  Tooltip,
  useToast,
  type ThemeContrast,
  type ColorScheme,
  Sheet,
} from '@envsemble/envui';

export const mount = 'root';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];
const people = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];
const commands = [{ id: 'rename', label: 'Rename' }];

/**
 * One popup of each kind, named after the boundary it opens from: menus (standard, compact, context
 * and menubar), Select lists (standard and compact), a Combobox list, the date picker, a popover, a
 * hover card, a tooltip, dialogs (centered and at the edge), the command palette and a toast. Toasts
 * take the theme of their provider, so each boundary has one.
 */
export function Popups({ name }: { name: string }) {
  return (
    <ToastProvider>
      <PopupTriggers name={name} />
    </ToastProvider>
  );
}

function PopupTriggers({ name }: { name: string }) {
  const toast = useToast();
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  return (
    <div className="fixture-actions">
      <Menu.Root
        aria-label={`Actions ${name}`}
        trigger={<Button variant="secondary">Menu {name}</Button>}
      >
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
      <Menu.Root
        aria-label={`Compact actions ${name}`}
        trigger={<Button variant="secondary">Compact menu {name}</Button>}
      >
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
      <ContextMenu aria-label={`Context actions ${name}`} content={<Menu.Item>Copy</Menu.Item>}>
        <div className="fixture-context-area">Context {name}</div>
      </ContextMenu>
      <Menubar.Root aria-label={`Menubar ${name}`}>
        <Menubar.Menu label={`File ${name}`}>
          <Menu.Item>New</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <Select label={`Sort ${name}`} items={statusOptions} defaultValue="open" />
      <Combobox label={`Person ${name}`} items={people} />
      <DatePicker label={`Due ${name}`} defaultValue="2026-10-20" locale="en-GB" />
      {/* No hover delay: these boundaries test colors, and HoverCard.test.tsx tests the delay. */}
      <HoverCard delay={0} trigger={<Link href="#card">Card {name}</Link>}>
        <Text>Card {name} details.</Text>
      </HoverCard>
      <Sheet
        side="end"
        title={`Panel ${name}`}
        trigger={<Button variant="secondary">Panel {name}</Button>}
      >
        <Text>Panel content.</Text>
      </Sheet>
      <Button variant="secondary" onClick={() => setPalette(true)}>
        Palette {name}
      </Button>
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        aria-label={`Palette ${name}`}
        inputValue={query}
        onInputValueChange={setQuery}
        items={commands}
        onAction={() => setPalette(false)}
      />
      <Button variant="secondary" onClick={() => toast.show({ message: `Toast ${name}` })}>
        Toast {name}
      </Button>
      <Popover
        title={`Details ${name}`}
        trigger={<Button variant="secondary">Popover {name}</Button>}
      >
        <Text>Last changed today.</Text>
      </Popover>
      <Select label={`Status ${name}`} items={statusOptions} defaultValue="open" />
      <Tooltip delay={0} content={`Tooltip ${name}`}>
        <Button variant="secondary">Tooltip {name}</Button>
      </Tooltip>
      <Dialog title={`Dialog ${name}`} trigger={<Button variant="secondary">Dialog {name}</Button>}>
        <Text>Dialog content.</Text>
      </Dialog>
    </div>
  );
}

function Boundary({
  name,
  theme,
  contrast,
}: {
  name: string;
  theme: ColorScheme;
  contrast?: ThemeContrast;
}) {
  return (
    <Theme
      theme={theme}
      contrast={contrast}
      data-testid={`contrast-${name.replaceAll(' ', '-')}`}
      className="fixture-section"
    >
      <Popups name={name} />
    </Theme>
  );
}

/**
 * Theme boundaries of each contrast, at the top of the page with no Theme around them, so the
 * boundaries without a contrast take the default.
 */
export default function ThemeContrastFixture() {
  return (
    <>
      <Boundary name="high" theme="light" contrast="high" />
      <Boundary name="standard" theme="light" contrast="standard" />
      <Boundary name="system" theme="light" />
      <Boundary name="system dark" theme="dark" />
      <Theme theme="light" contrast="high">
        <Boundary name="nested high" theme="dark" />
      </Theme>
      <Theme theme="light" contrast="standard">
        <Boundary name="nested standard" theme="dark" />
      </Theme>
    </>
  );
}
