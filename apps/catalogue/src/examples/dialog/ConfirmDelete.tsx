import { useState } from 'react';
import { Button, Dialog, Column, Text } from '@envsemble/envui';

export default function ConfirmDelete() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  return (
    <Column gap={4} align="start">
      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="secondary">Delete project</Button>}
        title="Delete project?"
        description="This deletes Northwind launch and its files for everyone. It can’t be undone."
        closeLabel="Cancel"
        actions={
          <Button
            variant="primary"
            tone="danger"
            onClick={() => {
              setOpen(false);
              setResult('Northwind launch deleted');
            }}
          >
            Delete project
          </Button>
        }
      />
      <Text role="status">{result}</Text>
    </Column>
  );
}
