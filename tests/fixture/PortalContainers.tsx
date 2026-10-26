import { useEffect, useState } from 'react';
import {
  Button,
  Combobox,
  ContextMenu,
  Dialog,
  IconButton,
  Menu,
  PortalContainer,
  Theme,
  Toast,
  Tooltip,
  useToast,
} from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

/** A toast shown as the preview mounts, kept until it is dismissed. */
function SavedNotice() {
  const toast = useToast();
  useEffect(() => {
    const id = toast.show({ message: 'Changes saved.', duration: Infinity });
    return () => toast.dismiss(id);
  }, [toast]);
  return null;
}

/**
 * Preview regions of a page, not inert, whose overlays render into a layer of each through a
 * contained PortalContainer, open as the page loads: a menu, a tooltip and a toast in one, a dialog
 * in another, a combobox's list in the third; a fourth holds a context menu, opened by right click.
 * The page is taller than the window, so its scroll can be checked.
 */
export function PortalContainersFixture() {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const [dialogLayer, setDialogLayer] = useState<HTMLDivElement | null>(null);
  const [comboboxLayer, setComboboxLayer] = useState<HTMLDivElement | null>(null);
  const [contextLayer, setContextLayer] = useState<HTMLDivElement | null>(null);
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
          <Toast.Provider>
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
              <IconButton icon={<Refresh />} aria-label="Refresh members" />
            </Tooltip>
            <SavedNotice />
          </Toast.Provider>
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
      {/* Taller than the window, so the page scrolls. */}
      <div style={{ blockSize: '150vh' }} />
    </Theme>
  );
}
