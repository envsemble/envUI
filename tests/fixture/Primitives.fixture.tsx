import { useCallback, useRef, useState, type ComponentType } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  Alert,
  Button,
  ConfirmButton,
  CopyButton,
  EnvUIProvider,
  Field,
  IconButton,
  Popover,
  Column,
  Row,
  Text,
  TextField,
  Toolbar,
  useLocale,
} from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';
import { IconHelp } from '@envsemble/envui/icons/Help';
import { IconUndo } from '@envsemble/envui/icons/Undo';
import { IconSettings } from '@envsemble/envui/icons/Settings';
// Internal primitives, which only envUI's own components use: the fixture mounts them directly.
import { PopupSurface } from '../../packages/ui/src/internal/PopupSurface.js';
import { ListRow } from '../../packages/ui/src/internal/ListRow.js';
import { ResizeHandle } from '../../packages/ui/src/internal/ResizeHandle.js';
import { useRovingFocus } from '../../packages/ui/src/internal/useRovingFocus.js';
import { useCopy } from '../../packages/ui/src/internal/useCopy.js';

export const mount = 'standalone';

/** Toolbar: roving focus, tooltips, a pressed toggle, a disabled button and a link. */
function ToolbarSample() {
  const [bold, setBold] = useState(false);
  const [pressed, setPressed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <Column gap={2} data-testid="toolbar">
      <button type="button">Before toolbar</button>
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Group aria-label="Text style">
          <Toolbar.Button
            icon={<IconFormatBold />}
            label="Bold"
            shortcut="Ctrl+B"
            pressed={bold}
            onClick={() => setBold((current) => !current)}
          />
          <Toolbar.Button
            icon={<IconFormatItalic />}
            label="Italic"
            onClick={() => setPressed((current) => [...current, 'italic'])}
          />
          <Toolbar.Button icon={<IconFormatUnderlined />} label="Underline" disabled />
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Button icon={<IconUndo />} label="Undo" />
        <IconButton
          icon={<IconSettings />}
          aria-label="Toolbar settings"
          data-testid="app-button"
        />
        <Toolbar.Link href="#help" icon={<IconHelp />} label="Help" />
      </Toolbar.Root>
      <button type="button">After toolbar</button>
      <Toolbar.Root aria-label="Disabled toolbar" disabled>
        <Toolbar.Button icon={<IconFormatBold />} label="Highlight" shortcut="Ctrl+Shift+B" />
        <Toolbar.Link href="#shortcuts" icon={<IconHelp />} label="Shortcuts" />
      </Toolbar.Root>
      {/* Disabled while busy, as an editor's toolbar is while it saves. */}
      <Toolbar.Root aria-label="Partly disabled" disabled={busy}>
        <Toolbar.Button icon={<IconUndo />} label="Redo" shortcut="Ctrl+K Ctrl+Z" />
        <Toolbar.Button icon={<IconFormatBold />} label="Strong emphasis" shortcut="⌘B" />
        <Toolbar.Group aria-label="Group" disabled={busy}>
          <Toolbar.Button icon={<IconFormatItalic />} label="Clear formatting" />
        </Toolbar.Group>
      </Toolbar.Root>
      <Toolbar.Root aria-label="Group only">
        <Toolbar.Group aria-label="Busy group" disabled={busy}>
          <Toolbar.Button icon={<IconFormatUnderlined />} label="Strike through" />
        </Toolbar.Group>
      </Toolbar.Root>
      <Toolbar.Root aria-label="Instant names" tooltipDelay={0}>
        <Toolbar.Button icon={<IconFormatBold />} label="Instant button" />
        <Toolbar.Link href="#help" icon={<IconHelp />} label="Instant link" />
      </Toolbar.Root>
      <button type="button" onClick={() => setBusy((current) => !current)}>
        Toggle busy
      </button>
      <output data-testid="toolbar-pressed">{pressed.join(',')}</output>
    </Column>
  );
}

/**
 * Emphasis: buttons with a tone in a toolbar, whose ghost default they take where it has their
 * tone; ConfirmButton and CopyButton, which follow it too; and a pair no variant is designed in,
 * which only code past the types can ask for.
 */
function EmphasisSample() {
  // Past the types on purpose: the undesigned pair the runtime check must catch.
  const undesigned = { variant: 'secondary', tone: 'danger' };
  const LooseButton = Button as unknown as ComponentType<Record<string, unknown>>;
  // Mounted on request, so its deliberate console error reaches only the test that asks for it.
  const [showUndesigned, setShowUndesigned] = useState(false);
  return (
    <Column gap={2} data-testid="emphasis">
      <Toolbar.Root aria-label="Emphasis">
        <Button tone="accent" data-testid="toolbar-accent">
          Publish
        </Button>
        <Button tone="danger" data-testid="toolbar-danger">
          Delete
        </Button>
        <ConfirmButton confirmLabel="Remove" onConfirm={() => {}} data-testid="toolbar-confirm">
          Remove
        </ConfirmButton>
        <CopyButton value="text" aria-label="Copy text" data-testid="toolbar-copy" />
        {/* A portal leaves the toolbar: the popover's buttons take their own defaults. */}
        <Popover
          title="Share"
          trigger={<Button data-testid="toolbar-popover-trigger">Share</Button>}
        >
          <Button data-testid="toolbar-popover-button">Send link</Button>
        </Popover>
      </Toolbar.Root>
      <TextField
        label="Link"
        endAction={
          <Popover
            title="Link options"
            trigger={<IconButton icon={<IconSettings />} aria-label="Link options" />}
          >
            <Button data-testid="field-popover-button">Shorten link</Button>
          </Popover>
        }
      />
      <Row gap={2}>
        <ConfirmButton confirmLabel="Remove" onConfirm={() => {}} data-testid="confirm-resting">
          Remove
        </ConfirmButton>
        <CopyButton value="text" aria-label="Copy text" data-testid="copy-resting" />
        <Button variant="secondary" onClick={() => setShowUndesigned(true)}>
          Show undesigned
        </Button>
        {showUndesigned && (
          <LooseButton {...undesigned} data-testid="undesigned">
            Undesigned
          </LooseButton>
        )}
      </Row>
    </Column>
  );
}

/** A toolbar whose callback ref returns a cleanup, as React 19 allows, mounted and unmounted. */
function RefCleanupSample() {
  const [mounted, setMounted] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const ref = useCallback((element: HTMLDivElement | null) => {
    setLog((current) => [...current, element ? 'attach' : 'null']);
    return () => setLog((current) => [...current, 'cleanup']);
  }, []);
  return (
    <Column gap={2}>
      <button type="button" onClick={() => setMounted((current) => !current)}>
        Toggle ref toolbar
      </button>
      {mounted && (
        <Toolbar.Root aria-label="Ref toolbar" ref={ref}>
          <Toolbar.Button icon={<IconFormatBold />} label="Ref quote" />
        </Toolbar.Root>
      )}
      <output data-testid="ref-log">{log.join(',')}</output>
    </Column>
  );
}

/** Field: label, control, description and error wired through Base UI's Field. */
function FieldSample() {
  const [invalid, setInvalid] = useState(false);
  return (
    <Column gap={4} data-testid="field">
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
    </Column>
  );
}

/** An Alert's dismiss button, a small IconButton with a cross, for its touch-size hit area. */
function CloseButtonSample() {
  return (
    <div data-testid="close-buttons">
      <Alert title="Saved" onDismiss={() => {}}>
        The draft is saved.
      </Alert>
    </div>
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
function DirectedPopup({ dir }: { dir: 'ltr' | 'rtl' }) {
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div dir={dir}>
      <BasePopover.Root>
        <BasePopover.Trigger
          ref={trigger}
          render={<Button variant="secondary">{`Open ${dir}`}</Button>}
        />
        <PopupSurface
          trigger={trigger}
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
  );
}

function PopupSample() {
  return (
    <Row gap={4} data-testid="popups">
      <DirectedPopup dir="ltr" />
      <DirectedPopup dir="rtl" />
    </Row>
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
          icon={<IconSettings />}
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
    <Row gap={2} data-testid="copy">
      <Button variant="secondary" onClick={(event) => void copy('Northwind', event.currentTarget)}>
        Copy name
      </Button>
      <output data-testid="copy-status">{status}</output>
      <output data-testid="copy-written">{written}</output>
    </Row>
  );
}

function LocaleProbe() {
  return <output data-testid="locale">{useLocale() ?? 'runtime'}</output>;
}

/** The primitives batch A adds, mounted with ?fixture=primitives. */
export default function PrimitivesFixture() {
  return (
    <Column gap={6}>
      <ToolbarSample />
      <EmphasisSample />
      <RefCleanupSample />
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
    </Column>
  );
}
