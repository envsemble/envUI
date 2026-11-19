import { useState } from 'react';
import { Button, Column, Dialog, DialogClose, Text, TextField } from '@envsemble/envui';

export default function EditMember() {
  const [result, setResult] = useState('');
  return (
    <Column gap={4} align="start">
      <Dialog
        trigger={<Button variant="secondary">Edit member</Button>}
        title="Priya Shah"
        closeButtonPlacement="heading"
        actionsStart={
          <DialogClose variant="text" tone="danger" onClick={() => setResult('Member removed')}>
            Remove from team
          </DialogClose>
        }
        actions={
          <DialogClose variant="primary" onClick={() => setResult('Changes saved')}>
            Save
          </DialogClose>
        }
      >
        <TextField label="Role" defaultValue="Designer" />
      </Dialog>
      <Text role="status">{result}</Text>
    </Column>
  );
}
