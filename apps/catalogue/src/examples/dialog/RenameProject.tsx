import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, Column, Text, TextField } from '@envsemble/envui';

export default function RenameProject() {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Northwind launch');
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) setDraft(name);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    // Saving takes a moment; a timer stands in for it here.
    window.setTimeout(() => {
      setSaving(false);
      setName(draft.trim() || name);
      setOpen(false);
    }, 2000);
  };
  return (
    <Column gap={4} align="start">
      <Text>{name}</Text>
      <Dialog
        open={open}
        onOpenChange={openChange}
        trigger={<Button variant="secondary">Rename project</Button>}
        title="Rename project"
        description="Everyone in the workspace sees the new name."
        closeLabel="Cancel"
        pending={saving}
        actions={
          <Button type="submit" form={formId} pending={saving}>
            Save name
          </Button>
        }
      >
        <form id={formId} onSubmit={save}>
          <TextField
            label="Project name"
            value={draft}
            readOnly={saving}
            onChange={(event) => setDraft(event.target.value)}
          />
        </form>
      </Dialog>
    </Column>
  );
}
