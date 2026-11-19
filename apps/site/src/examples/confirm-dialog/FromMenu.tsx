import { useRef, useState } from 'react';
import { ConfirmDialog, IconButton, Menu } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export default function FromMenu() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Menu.Root
        aria-label="Project actions"
        trigger={<IconButton ref={menuButton} icon={<IconMoreVert />} aria-label="More actions" />}
      >
        <Menu.Item start={<IconDelete />} onClick={() => setOpen(true)}>
          Delete project…
        </Menu.Item>
      </Menu.Root>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
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
