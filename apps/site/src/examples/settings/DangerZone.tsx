import { useId, useState } from 'react';
import { Button, ConfirmDialog, List, Column, Text, TextField } from '@envsemble/envui';

const workspace = 'Northwind';

export default function DangerZone() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleted, setDeleted] = useState(false);
  const matches = typed.trim() === workspace;

  return (
    <Column render={<section aria-labelledby={`${id}-heading`} />} gap={3}>
      <Text render={<h3 id={`${id}-heading`} />} variant="title">
        Danger zone
      </Text>
      <List.Root aria-labelledby={`${id}-heading`}>
        <List.Item
          label="Delete this workspace"
          description="Deletes every project, document and member of Northwind."
          end={
            <Button
              variant="outline"
              tone="danger"
              onClick={() => {
                setTyped('');
                setOpen(true);
              }}
            >
              Delete workspace…
            </Button>
          }
        />
      </List.Root>
      <Text role="status" emphasis="muted">
        {deleted ? `${workspace} workspace deleted.` : ''}
      </Text>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title={`Delete the ${workspace} workspace?`}
        description="This deletes every project, document and member, for everyone. You can’t undo this."
        confirmLabel="Delete workspace"
        confirmDisabled={!matches}
        onConfirm={() => {
          // The workspace is deleted on a server, and the application then leaves it; the example
          // only says so.
          setDeleted(true);
        }}
      >
        <TextField
          label="Workspace name"
          description={`Enter ${workspace} to confirm.`}
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onValueChange={setTyped}
        />
      </ConfirmDialog>
    </Column>
  );
}
