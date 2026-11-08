import { useEffect, useState } from 'react';
import {
  Button,
  Combobox,
  ContextMenu,
  DatePicker,
  Dialog,
  IconButton,
  Menu,
  Menubar,
  Panes,
  PortalContainer,
  Theme,
  ToastProvider,
  Tooltip,
  useToast,
} from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';

export const mount = 'standalone';

/** A toast shown as the preview mounts, kept until it is dismissed. */
function SavedNotice() {
  const toast = useToast();
  useEffect(() => {
    const id = toast.show({ message: 'Changes saved.', duration: Infinity });
    return () => toast.dismiss(id);
  }, [toast]);
  return null;
}

/** A button that raises a short notice, which stays while the pointer rests on it. */
function NotifyButton() {
  const toast = useToast();
  return (
    <Button onClick={() => toast.show({ message: 'Invitation sent.', duration: 1200 })}>
      Notify
    </Button>
  );
}

/**
 * Preview regions of a page, not inert, whose overlays render into a layer of each through a
 * contained PortalContainer, open as the page loads: a menu, a tooltip and a toast in one, a dialog
 * in another, a combobox's list in the third; a fourth holds a context menu, opened by right click,
 * a fifth a menubar, a sixth supporting Panes too narrow for two panes, open as a sheet, and a
 * seventh a date picker, closed.
 * The page is taller than the window, so its scroll can be checked.
 */
export default function PortalContainerFixture() {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const [dialogLayer, setDialogLayer] = useState<HTMLDivElement | null>(null);
  const [comboboxLayer, setComboboxLayer] = useState<HTMLDivElement | null>(null);
  const [contextLayer, setContextLayer] = useState<HTMLDivElement | null>(null);
  const [menubarLayer, setMenubarLayer] = useState<HTMLDivElement | null>(null);
  const [panesLayer, setPanesLayer] = useState<HTMLDivElement | null>(null);
  const [pickerLayer, setPickerLayer] = useState<HTMLDivElement | null>(null);
  const [panesOpen, setPanesOpen] = useState(true);
  const region = {
    position: 'relative',
    contain: 'layout',
    containerType: 'inline-size',
    blockSize: '24rem',
    inlineSize: '40rem',
    marginBlockStart: '2rem',
    paddingBlockStart: '4rem',
  } as const;
  return (
    <Theme theme="light" className="fixture-section">
      <Button data-testid="outside">Outside the preview</Button>
      <div data-testid="preview" style={region}>
        <PortalContainer container={layer} contained>
          <ToastProvider>
            <Menu.Root
              aria-label="Actions"
              defaultOpen
              align="start"
              trigger={<Button>Actions</Button>}
            >
              <Menu.Item>Rename</Menu.Item>
              <Menu.Item>Delete</Menu.Item>
            </Menu.Root>
            <Tooltip content="Refresh members" defaultOpen>
              <IconButton icon={<IconRefresh />} aria-label="Refresh members" />
            </Tooltip>
            <SavedNotice />
            <NotifyButton />
          </ToastProvider>
        </PortalContainer>
        <div ref={setLayer} data-testid="layer" />
      </div>
      <div data-testid="dialog-preview" style={region}>
        <PortalContainer container={dialogLayer} contained>
          <Dialog defaultOpen title="Rename project" closeLabel="Cancel" />
        </PortalContainer>
        <div ref={setDialogLayer} data-testid="dialog-layer" />
      </div>
      <div data-testid="combobox-preview" style={region}>
        <PortalContainer container={comboboxLayer} contained>
          <Combobox
            label="Owner"
            items={[
              { value: 'alex', label: 'Alex Morgan' },
              { value: 'sam', label: 'Sam Lee' },
            ]}
            defaultOpen
          />
        </PortalContainer>
        <div ref={setComboboxLayer} data-testid="combobox-layer" />
      </div>
      <div data-testid="context-preview" style={region}>
        <PortalContainer container={contextLayer} contained>
          <ContextMenu aria-label="Document actions" content={<Menu.Item>Duplicate</Menu.Item>}>
            <div data-testid="context-region" style={{ blockSize: '8rem' }}>
              Quarterly report
            </div>
          </ContextMenu>
        </PortalContainer>
        <div ref={setContextLayer} data-testid="context-layer" />
      </div>
      <div data-testid="menubar-preview" style={region}>
        <PortalContainer container={menubarLayer} contained>
          <Menubar.Root aria-label="Application menu">
            <Menubar.Menu label="File">
              <Menu.Item>New note</Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu label="Edit">
              <Menu.Item>Copy</Menu.Item>
            </Menubar.Menu>
          </Menubar.Root>
        </PortalContainer>
        <div ref={setMenubarLayer} data-testid="menubar-layer" />
      </div>
      <div data-testid="panes-preview" style={{ ...region, inlineSize: '24rem' }}>
        <PortalContainer container={panesLayer} contained>
          <Panes.Root behavior="supporting" open={panesOpen} onOpenChange={setPanesOpen}>
            <Panes.Main label="Document">
              <Button>In the document</Button>
            </Panes.Main>
            <Panes.Supporting label="Details">
              <Button>Edit details</Button>
            </Panes.Supporting>
          </Panes.Root>
        </PortalContainer>
        <div ref={setPanesLayer} data-testid="panes-layer" />
      </div>
      <div data-testid="picker-preview" style={region}>
        <PortalContainer container={pickerLayer} contained>
          <DatePicker label="Due" />
        </PortalContainer>
        <div ref={setPickerLayer} data-testid="picker-layer" />
      </div>
      {/* Taller than the window, so the page scrolls. */}
      <div style={{ blockSize: '150vh' }} />
    </Theme>
  );
}
