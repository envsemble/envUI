import { useRef, useState, type ComponentType } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  Alert,
  Button,
  ConfirmButton,
  CopyButton,
  Field,
  IconButton,
  Kbd,
  Popover,
  Column,
  Row,
  Text,
  TextField,
  Toolbar,
} from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';
import { IconHelp } from '@envsemble/envui/icons/Help';
import { IconUndo } from '@envsemble/envui/icons/Undo';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { PopupSurface } from '../../packages/ui/src/internal/popup/PopupSurface.js';
import { ListRow } from '../../packages/ui/src/internal/popup/ListRow.js';
import { ResizeHandle } from '../../packages/ui/src/layout/ResizeHandle.js';
import { useCopy } from '../../packages/ui/src/internal/react/useCopy.js';

export const mount = 'standalone';

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

function EmphasisSample() {
  const undesigned = { variant: 'secondary', tone: 'danger' };
  const LooseButton = Button as unknown as ComponentType<Record<string, unknown>>;
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

function CloseButtonSample() {
  return (
    <div data-testid="close-buttons">
      <Alert title="Saved" onDismiss={() => {}}>
        The draft is saved.
      </Alert>
    </div>
  );
}

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
          start={<IconSettings />}
          label="Settings"
          description="Account and workspace"
          end={<Kbd keys={['Ctrl', ',']} />}
        />
        <ListRow render={<BaseMenu.Item disabled />} label="Archive" />
      </PopupSurface>
    </BaseMenu.Root>
  );
}

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

export default function PrimitivesFixture() {
  return (
    <Column gap={6}>
      <ToolbarSample />
      <EmphasisSample />
      <FieldSample />
      <CloseButtonSample />
      <ResizeSample dir="ltr" />
      <ResizeSample dir="rtl" />
      <PopupSample />
      <ListRowSample />
      <CopySample />
    </Column>
  );
}
