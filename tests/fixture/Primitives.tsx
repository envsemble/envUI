import { useState } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  Button,
  CloseButton,
  ConfirmButton,
  CopyButton,
  EnvUIProvider,
  Field,
  IconButton,
  Stack,
  Text,
  Toolbar,
  useLocale,
  type ButtonProps,
} from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { FormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';
import { Help } from '@envsemble/envui/icons/Help';
import { Undo } from '@envsemble/envui/icons/Undo';
import { Settings } from '@envsemble/envui/icons/Settings';
// Internal primitives, which only envUI's own components use: the fixture mounts them directly.
import { PopupSurface } from '../../packages/ui/src/internal/PopupSurface.js';
import { ListRow } from '../../packages/ui/src/internal/ListRow.js';
import { ResizeHandle } from '../../packages/ui/src/internal/ResizeHandle.js';
import { useRovingFocus } from '../../packages/ui/src/internal/useRovingFocus.js';
import { useCopy } from '../../packages/ui/src/internal/useCopy.js';

/** Toolbar: roving focus, tooltips, a pressed toggle, a disabled button and a link. */
function ToolbarSample() {
  const [bold, setBold] = useState(false);
  const [pressed, setPressed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <Stack gap={2} data-testid="toolbar">
      <button type="button">Before toolbar</button>
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Group aria-label="Text style">
          <Toolbar.Button
            icon={<FormatBold />}
            label="Bold"
            shortcut="Ctrl+B"
            pressed={bold}
            onClick={() => setBold((current) => !current)}
          />
          <Toolbar.Button
            icon={<FormatItalic />}
            label="Italic"
            onClick={() => setPressed((current) => [...current, 'italic'])}
          />
          <Toolbar.Button icon={<FormatUnderlined />} label="Underline" disabled />
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Button icon={<Undo />} label="Undo" />
        <IconButton icon={<Settings />} aria-label="Toolbar settings" data-testid="app-button" />
        <Toolbar.Link href="#help" icon={<Help />} label="Help" />
      </Toolbar.Root>
      <button type="button">After toolbar</button>
      <Toolbar.Root aria-label="Disabled toolbar" disabled>
        <Toolbar.Button icon={<FormatBold />} label="Highlight" shortcut="Ctrl+Shift+B" />
      </Toolbar.Root>
      {/* Disabled while busy, as an editor's toolbar is while it saves. */}
      <Toolbar.Root aria-label="Partly disabled" disabled={busy}>
        <Toolbar.Button icon={<Undo />} label="Redo" shortcut="Ctrl+K Ctrl+Z" />
        <Toolbar.Group aria-label="Group" disabled={busy}>
          <Toolbar.Button icon={<FormatItalic />} label="Clear formatting" />
        </Toolbar.Group>
      </Toolbar.Root>
      <Toolbar.Root aria-label="Group only">
        <Toolbar.Group aria-label="Busy group" disabled={busy}>
          <Toolbar.Button icon={<FormatUnderlined />} label="Strike through" />
        </Toolbar.Group>
      </Toolbar.Root>
      <button type="button" onClick={() => setBusy((current) => !current)}>
        Toggle busy
      </button>
      <output data-testid="toolbar-pressed">{pressed.join(',')}</output>
    </Stack>
  );
}

/**
 * Emphasis: buttons with a tone in a toolbar, whose ghost default they take where it has their
 * tone; ConfirmButton and CopyButton, which follow it too; and a pair no variant is designed in,
 * which only code past the types can ask for.
 */
function EmphasisSample() {
  const undesigned = { variant: 'secondary', tone: 'danger' } as unknown as ButtonProps;
  return (
    <Stack gap={2} data-testid="emphasis">
      <Toolbar.Root aria-label="Emphasis">
        <Button tone="accent" data-testid="toolbar-accent">
          Publish
        </Button>
        <Button tone="danger" data-testid="toolbar-danger">
          Delete
        </Button>
        <ConfirmButton confirmLabel="Remove?" onConfirm={() => {}} data-testid="toolbar-confirm">
          Remove
        </ConfirmButton>
        <CopyButton value="text" aria-label="Copy text" data-testid="toolbar-copy" />
      </Toolbar.Root>
      <Stack direction="row" gap={2}>
        <ConfirmButton confirmLabel="Remove?" onConfirm={() => {}} data-testid="confirm-resting">
          Remove
        </ConfirmButton>
        <CopyButton value="text" aria-label="Copy text" data-testid="copy-resting" />
        <Button {...undesigned} data-testid="undesigned">
          Undesigned
        </Button>
      </Stack>
    </Stack>
  );
}

/** Field: label, control, description and error wired through Base UI's Field. */
function FieldSample() {
  const [invalid, setInvalid] = useState(false);
  return (
    <Stack gap={4} data-testid="field">
      <Field.Root name="project" invalid={invalid}>
        <Field.Label>Project name</Field.Label>
        <Field.Control placeholder="Northwind" />
        <Field.Description>Up to 40 characters.</Field.Description>
        <Field.Error>Enter a project name.</Field.Error>
      </Field.Root>
      <Button variant="secondary" onClick={() => setInvalid((current) => !current)}>
        Toggle invalid
      </Button>
      <Field.Root disabled>
        <Field.Label>Disabled field</Field.Label>
        <Field.Control defaultValue="Locked" />
      </Field.Root>
    </Stack>
  );
}

/** CloseButton: its default name, a provider's message and an own label. */
function CloseButtonSample() {
  return (
    <Stack direction="row" gap={2} data-testid="close-buttons">
      <CloseButton data-testid="close-default" />
      <EnvUIProvider messages={{ common: { close: 'Schließen' } }}>
        <CloseButton data-testid="close-provider" />
        <CloseButton aria-label="Remove Alex Morgan" data-testid="close-own" />
      </EnvUIProvider>
      <CloseButton size="sm" variant="secondary" data-testid="close-small" />
    </Stack>
  );
}

/** ResizeHandle: keys, pointer and the text direction. */
function ResizeSample({ dir }: { dir: 'ltr' | 'rtl' }) {
  const [width, setWidth] = useState(200);
  const [committed, setCommitted] = useState(200);
  return (
    <div dir={dir} data-testid={`resize-${dir}`} style={{ display: 'flex', inlineSize: '40rem' }}>
      <div data-testid={`pane-${dir}`} style={{ inlineSize: width, background: '#eef' }}>
        Pane
      </div>
      <ResizeHandle
        axis="inline"
        label="Resize pane"
        value={width}
        min={100}
        max={400}
        onChange={(value, { committed: done }) => {
          setWidth(value);
          if (done) setCommitted(value);
        }}
      />
      <output data-testid={`committed-${dir}`}>{committed}</output>
    </div>
  );
}

const days = Array.from({ length: 14 }, (_, index) => ({
  id: `day-${index + 1}`,
  label: `${index + 1}`,
  disabled: index === 4,
}));

/** useRovingFocus in a seven-column grid, with one disabled cell. */
function RovingGridSample({ dir }: { dir: 'ltr' | 'rtl' }) {
  const [active, setActive] = useState<string | null>(null);
  const roving = useRovingFocus({
    items: days,
    getKey: (day) => day.id,
    isDisabled: (day) => day.disabled,
    orientation: 'grid',
    columns: 7,
    dir,
    activeKey: active,
    onActiveKeyChange: setActive,
  });
  return (
    <div
      role="grid"
      aria-label={`Days ${dir}`}
      dir={dir}
      data-testid={`grid-${dir}`}
      {...roving.getContainerProps()}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 2.5rem)', gap: '0.25rem' }}
    >
      {days.map((day) => (
        <div
          key={day.id}
          role="gridcell"
          aria-disabled={day.disabled || undefined}
          {...roving.getItemProps(day)}
        >
          {day.label}
        </div>
      ))}
    </div>
  );
}

/** useRovingFocus in a vertical list with typeahead. */
function RovingListSample() {
  const people = ['Alex Morgan', 'Priya Shah', 'Sam Lee', 'Samir Haddad'];
  const [active, setActive] = useState<string | null>(null);
  const roving = useRovingFocus({
    items: people,
    getKey: (person) => person,
    orientation: 'vertical',
    activeKey: active,
    onActiveKeyChange: setActive,
    typeahead: (person) => person,
  });
  return (
    <div
      role="listbox"
      aria-label="People"
      data-testid="roving-list"
      {...roving.getContainerProps()}
    >
      {people.map((person) => (
        <div
          key={person}
          role="option"
          aria-selected={person === active}
          {...roving.getItemProps(person)}
        >
          {person}
        </div>
      ))}
    </div>
  );
}

/** PopupSurface: Popover parts, the theme carried into the portal and the trigger's direction. */
function PopupSample() {
  return (
    <Stack direction="row" gap={4} data-testid="popups">
      {(['ltr', 'rtl'] as const).map((dir) => (
        <div key={dir} dir={dir}>
          <BasePopover.Root>
            <BasePopover.Trigger render={<Button variant="secondary">{`Open ${dir}`}</Button>} />
            <PopupSurface
              parts={{
                Portal: BasePopover.Portal,
                Positioner: BasePopover.Positioner,
                Popup: BasePopover.Popup,
              }}
              align="start"
              width="md"
              popupProps={{ 'aria-label': `Popup ${dir}`, 'data-testid': `popup-${dir}` }}
            >
              <Text>Details</Text>
            </PopupSurface>
          </BasePopover.Root>
        </div>
      ))}
    </Stack>
  );
}

/** ListRow on Base UI Menu items. */
function ListRowSample() {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={<Button variant="secondary">Open rows</Button>} />
      <PopupSurface
        parts={{ Portal: BaseMenu.Portal, Positioner: BaseMenu.Positioner, Popup: BaseMenu.Popup }}
        popupProps={{ 'data-testid': 'row-menu' }}
      >
        <ListRow
          render={<BaseMenu.Item />}
          icon={<Settings />}
          label="Settings"
          description="Account and workspace"
          shortcut="Ctrl+,"
        />
        <ListRow render={<BaseMenu.Item disabled />} label="Archive" />
      </PopupSurface>
    </BaseMenu.Root>
  );
}

/** useCopy with a custom writer. */
function CopySample() {
  const [written, setWritten] = useState('');
  const { copy, status } = useCopy({
    write: async (text) => {
      setWritten(text);
    },
  });
  return (
    <Stack direction="row" gap={2} data-testid="copy">
      <Button variant="secondary" onClick={(event) => void copy('Northwind', event.currentTarget)}>
        Copy name
      </Button>
      <output data-testid="copy-status">{status}</output>
      <output data-testid="copy-written">{written}</output>
    </Stack>
  );
}

function LocaleProbe() {
  return <output data-testid="locale">{useLocale() ?? 'runtime'}</output>;
}

/** The primitives batch A adds, mounted with ?fixture=primitives. */
export function PrimitivesFixture() {
  return (
    <Stack gap={6}>
      <ToolbarSample />
      <EmphasisSample />
      <FieldSample />
      <CloseButtonSample />
      <ResizeSample dir="ltr" />
      <ResizeSample dir="rtl" />
      <RovingGridSample dir="ltr" />
      <RovingGridSample dir="rtl" />
      <RovingListSample />
      <PopupSample />
      <ListRowSample />
      <CopySample />
      <LocaleProbe />
      <EnvUIProvider locale="de-CH">
        <span data-testid="provided-locale">
          <LocaleProbe />
        </span>
      </EnvUIProvider>
    </Stack>
  );
}
