import { Button, Dialog, Menu, Theme, Toast, Tooltip, useToast } from '@envsemble/envui';

/**
 * Every layer the library's style sheets give a z-index, as an element with the classes and the
 * ancestors its rule needs, named by data-layer. They are hidden and out of the way: the spec reads
 * their computed z-index only.
 */
function Ladder() {
  return (
    <div className="fixture-stacking-ladder" aria-hidden="true">
      <div className="env-app-shell">
        <div data-layer="app-topbar" className="env-app-topbar" />
        <div data-layer="app-sidebar" className="env-app-sidebar">
          <div data-layer="app-sidebar-resize" className="env-app-sidebar-resize" />
        </div>
      </div>
      <div className="env-app-shell" data-narrow="">
        <div data-layer="app-sidebar-narrow" className="env-app-sidebar" />
        <div data-layer="app-sidebar-backdrop" className="env-app-sidebar-backdrop" />
      </div>
      <div data-layer="dialog-backdrop" className="env-dialog-backdrop" />
      <div data-layer="dialog-positioner" className="env-dialog-positioner" />
      <div data-layer="command-palette-positioner" className="env-command-palette-positioner" />
      <div data-layer="menu-positioner" className="env-menu-positioner" />
      <div data-layer="popover-positioner" className="env-popover-positioner" />
      <div data-layer="select-positioner" className="env-select-positioner" />
      <div data-layer="tooltip-positioner" className="env-tooltip-positioner" />
      <div data-layer="rich-text-suggestions" className="env-rich-text-suggestions" />
      <div data-layer="toast-viewport" className="env-toast-viewport">
        <div data-layer="toast-leaving" className="env-toast" data-leaving="" />
      </div>
      <div data-layer="loading-bar" className="env-loading-bar" />
      <div
        data-layer="loading-bar-contained"
        className="env-loading-bar env-loading-bar-contained"
      />
      <div data-layer="panel-dock" className="env-panel-dock">
        <div data-layer="panel-dock-panel" className="env-panel-dock-panel" />
        <div data-layer="panel-dock-panel-active" className="env-panel-dock-panel" data-active="" />
        <div
          data-layer="panel-dock-panel-fill"
          className="env-panel-dock-panel"
          data-placement="fill"
        />
        <div
          data-layer="panel-dock-panel-hidden"
          className="env-panel-dock-panel"
          data-placement="hidden"
        />
        <div data-layer="panel-dock-resize" className="env-panel-dock-resize" />
        <div data-layer="panel-dock-header" className="env-panel-dock-header" />
        <div data-layer="panel-dock-strip" className="env-panel-dock-strip" />
      </div>
      <div className="env-table-region" data-sticky-header="">
        <div className="env-table-head">
          <div data-layer="table-sticky-header-cell" className="env-table-header-cell" />
        </div>
      </div>
      <div data-layer="table-column-resize" className="env-table-column-resize" />
    </div>
  );
}

/** A modal dialog that opens a menu, shows a notice and has a control with a tooltip. */
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
        onClick={() => toast.show({ message: 'Saved over the dialog', variant: 'info' })}
      >
        Show a notice
      </Button>
      <Tooltip content="Explains the control">
        <Button variant="secondary">Hover for a tooltip</Button>
      </Tooltip>
    </Dialog>
  );
}

export function StackingFixture() {
  return (
    <Theme theme="light" className="fixture-section">
      <Toast.Provider>
        <Ladder />
        <LayeredDialog />
      </Toast.Provider>
    </Theme>
  );
}
