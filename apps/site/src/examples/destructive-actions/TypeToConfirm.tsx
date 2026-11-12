import { useState } from 'react';
import { Button, ConfirmDialog, Column, Text, TextField } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';

const project = { name: 'Data migration', documents: 128, tasks: 46 };

export default function TypeToConfirm() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleted, setDeleted] = useState(false);
  const matches = typed.trim() === project.name;

  return (
    <Column gap={4} align="start">
      <Button
        variant="outline"
        tone="danger"
        startIcon={<IconDelete />}
        onClick={() => {
          setTyped('');
          setOpen(true);
        }}
      >
        Delete project…
      </Button>
      <Text role="status" emphasis="muted">
        {deleted ? `${project.name} deleted.` : ''}
      </Text>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title={`Delete ${project.name}?`}
        description={`This deletes the project, its ${project.documents} documents and ${project.tasks} tasks for everyone. You can’t undo this.`}
        confirmLabel="Delete project"
        confirmDisabled={!matches}
        onConfirm={() => {
          // The project is deleted on a server; the application would return its promise here, so
          // the dialog waits for it.
          setDeleted(true);
        }}
      >
        {/* The one field a confirmation holds: typing the name makes people read what they delete. */}
        <TextField
          label="Project name"
          description={`Enter ${project.name} to confirm.`}
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onValueChange={setTyped}
        />
      </ConfirmDialog>
    </Column>
  );
}
