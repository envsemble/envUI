import { useState } from 'react';
import { Button, ConfirmDialog, Column, Text } from '@envsemble/envui';

export default function DeleteProject() {
  const [result, setResult] = useState('');
  return (
    <Column gap={4} align="start">
      <ConfirmDialog
        trigger={<Button variant="secondary">Delete project</Button>}
        tone="danger"
        title="Delete Northwind launch?"
        description="This deletes the project and its files for everyone in the workspace. It can't be undone."
        confirmLabel="Delete project"
        onConfirm={() => setResult('Northwind launch deleted')}
      />
      <Text role="status">{result}</Text>
    </Column>
  );
}
