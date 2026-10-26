import { useRef, useState } from 'react';
import { ConfirmDialog, IconButton, Menu } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

export default function FromMenu() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Menu.Root
        aria-label="Project actions"
        trigger={<IconButton ref={menuButton} icon={<MoreVert />} aria-label="More actions" />}
      >
        <Menu.Item icon={<Delete />} onClick={() => setOpen(true)}>
          Delete project…
        </Menu.Item>
      </Menu.Root>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        // The menu item is gone once the menu closes; focus returns to the menu's button.
        finalFocus={menuButton}
        tone="danger"
        title="Delete Northwind launch?"
        description="This deletes the project and its files for everyone. It can’t be undone."
        confirmLabel="Delete project"
        onConfirm={() => {}}
      />
    </>
  );
}
