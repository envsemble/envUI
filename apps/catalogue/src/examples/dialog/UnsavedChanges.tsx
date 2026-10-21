import { useState } from 'react';
import { Button, Dialog, DialogClose, Column, Text } from '@envsemble/envui';

export default function UnsavedChanges() {
  const [result, setResult] = useState('');
  return (
    <Column gap={4} align="start">
      <Dialog
        trigger={<Button variant="secondary">Close editor</Button>}
        title="Save changes to Launch plan?"
        description="Your changes are lost if you don’t save them."
        closeLabel="Cancel"
        actions={
          <>
            <DialogClose onClick={() => setResult('Changes discarded')}>Don’t save</DialogClose>
            <DialogClose variant="primary" onClick={() => setResult('Changes saved')}>
              Save
            </DialogClose>
          </>
        }
      />
      <Text role="status">{result}</Text>
    </Column>
  );
}
