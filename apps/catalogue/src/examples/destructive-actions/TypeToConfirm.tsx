import { useRef, useState } from 'react';
import { Button, ConfirmDialog, Stack, Text, TextField } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';

const project = { name: 'Data migration', documents: 128, tasks: 46 };

export default function TypeToConfirm() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string>();
  const [deleted, setDeleted] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const matches = typed.trim() === project.name;

  return (
    <Stack gap={4} align="start">
      <Button
        variant="outline"
        tone="danger"
        startIcon={<Delete />}
        onClick={() => {
          setTyped('');
          setError(undefined);
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
        onOpenChange={(next, details) => {
          // Confirming without the right name keeps the dialog open, with the field's error.
          if (!next && details.reason === 'imperative-action' && !matches) return;
          setOpen(next);
        }}
        tone="danger"
        title={`Delete ${project.name}?`}
        description={`This deletes the project, its ${project.documents} documents and ${project.tasks} tasks for everyone. You can’t undo this.`}
        confirmLabel="Delete project"
        onConfirm={() => {
          if (!matches) {
            setError(`Enter ${project.name} to confirm`);
            field.current?.focus();
            return;
          }
          // The project is deleted on a server; the application would return its promise here, so
          // the dialog waits for it.
          setDeleted(true);
        }}
      >
        {/* The one field a confirmation holds: typing the name makes people read what they delete. */}
        <TextField
          ref={field}
          label="Project name"
          description={`Enter ${project.name} to confirm.`}
          autoComplete="off"
          spellCheck={false}
          value={typed}
          error={error}
          onValueChange={(value) => {
            setTyped(value);
            if (value.trim() === project.name) setError(undefined);
          }}
        />
      </ConfirmDialog>
    </Stack>
  );
}
