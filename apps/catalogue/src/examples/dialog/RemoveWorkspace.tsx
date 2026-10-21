import { useState } from 'react';
import { Button, Dialog, Column, Text, TextField } from '@envsemble/envui';

const workspace = 'Northwind';

export default function RemoveWorkspace() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState('');
  return (
    <Column gap={4} align="start">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setTyped('');
        }}
        trigger={<Button variant="secondary">Remove workspace</Button>}
        title="Remove workspace?"
        description={`This deletes ${workspace} and its projects for everyone. It can’t be undone.`}
        closeLabel="Cancel"
        actions={
          <Button
            variant="primary"
            tone="danger"
            disabled={typed !== workspace}
            onClick={() => {
              setOpen(false);
              setResult(`${workspace} removed`);
            }}
          >
            Remove workspace
          </Button>
        }
      >
        <TextField
          label="Workspace name"
          description={`Type ${workspace} to confirm.`}
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
        />
      </Dialog>
      <Text role="status">{result}</Text>
    </Column>
  );
}
