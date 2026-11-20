import {
  Button,
  Dialog,
  Menu,
  Sheet,
  Text,
  Theme,
  ToastProvider,
  Tooltip,
  useToast,
} from '@envsemble/envui';

export const mount = 'standalone';

function Ladder() {
  return (
    <div className="fixture-stacking-ladder" aria-hidden="true">
      <div data-layer="top-bar-sticky" className="env-top-bar" data-sticky="" />
      <div data-layer="dialog-backdrop" className="env-dialog-backdrop" />
      <div data-layer="dialog-positioner" className="env-dialog-positioner" />
      <div data-layer="command-palette-positioner" className="env-command-palette-positioner" />
      <div data-layer="popup-positioner" className="env-popup-positioner" />
      <div data-layer="menu-positioner" className="env-menu-positioner" />
      <div data-layer="tooltip-positioner" className="env-tooltip-positioner" />
      <div data-layer="toast-viewport" className="env-toast-viewport">
        <div data-layer="toast-leaving" className="env-toast" data-leaving="" />
      </div>
      <div data-layer="loading-bar" className="env-loading-bar" />
      <div className="env-table-region" data-sticky-header="">
        <div className="env-table-head">
          <div data-layer="table-sticky-header-cell" className="env-table-header-cell" />
        </div>
      </div>
      <div data-layer="table-column-resize" className="env-table-column-resize-handle" />
    </div>
  );
}

function LayeredDialog() {
  const toast = useToast();
  return (
    <Dialog title="Layered dialog" trigger={<Button>Open the layered dialog</Button>}>
      <Menu.Root aria-label="Dialog actions" trigger={<Button variant="secondary">Actions</Button>}>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item>Archive</Menu.Item>
      </Menu.Root>
      <Button
        variant="secondary"
        onClick={() => toast.show({ message: 'Saved over the dialog', tone: 'info' })}
      >
        Show a notice
      </Button>
      <Tooltip content="Explains the control">
        <Button variant="secondary">Hover for a tooltip</Button>
      </Tooltip>
    </Dialog>
  );
}

function NestedModals() {
  return (
    <Sheet title="Filters" trigger={<Button>Open the sheet</Button>}>
      <Dialog title="Discard the filters?" trigger={<Button>Discard…</Button>}>
        <Text>The filters you chose are cleared.</Text>
      </Dialog>
    </Sheet>
  );
}

export default function StackingFixture() {
  return (
    <Theme theme="light" className="fixture-section">
      <ToastProvider>
        <Ladder />
        <LayeredDialog />
        <NestedModals />
      </ToastProvider>
    </Theme>
  );
}
