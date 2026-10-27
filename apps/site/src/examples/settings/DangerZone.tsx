import { useId, useRef, useState } from 'react';
import { Button, ConfirmDialog, List, Column, Text, TextField } from '@envsemble/envui';

const workspace = 'Northwind';

export default function DangerZone() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string>();
  const [deleted, setDeleted] = useState(false);
  const field = useRef<HTMLInputElement>(null);
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
          action={
            <Button
              variant="outline"
              tone="danger"
              onClick={() => {
                setTyped('');
                setError(undefined);
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
        onOpenChange={(next, details) => {
          // A confirmation with the wrong name keeps the dialog open, with the field's error.
          if (!next && details.reason === 'imperative-action' && !matches) return;
          setOpen(next);
        }}
        tone="danger"
        title={`Delete the ${workspace} workspace?`}
        description="This deletes every project, document and member, for everyone. You can’t undo this."
        confirmLabel="Delete workspace"
        onConfirm={() => {
          if (!matches) {
            setError(`Enter ${workspace} to confirm`);
            field.current?.focus();
            return;
          }
          // The workspace is deleted on a server, and the application then leaves it; the example
          // only says so.
          setDeleted(true);
        }}
      >
        <TextField
          ref={field}
          variant="floating"
          label="Workspace name"
          description={`Enter ${workspace} to confirm.`}
          autoComplete="off"
          spellCheck={false}
          // Enter in the field confirms through onConfirm, as the confirm button does.
          value={typed}
          error={error}
          onValueChange={(value) => {
            setTyped(value);
            if (value.trim() === workspace) setError(undefined);
          }}
        />
      </ConfirmDialog>
    </Column>
  );
}
