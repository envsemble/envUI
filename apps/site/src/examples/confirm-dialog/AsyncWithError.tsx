import { useRef, useState } from 'react';
import { Button, ConfirmDialog, Column, Text } from '@envsemble/envui';

export default function AsyncWithError() {
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const attempts = useRef(0);
  // Stands in for a request: the first attempt fails, the next succeeds.
  const archive = () =>
    new Promise<void>((resolve, reject) => {
      attempts.current += 1;
      const fails = attempts.current === 1;
      setTimeout(() => {
        if (fails) {
          setError('The project could not be archived. Try again.');
          reject(new Error('Archive failed'));
        } else {
          setResult('Northwind launch archived');
          resolve();
        }
      }, 1200);
    });
  return (
    <Column gap={4} align="center">
      <ConfirmDialog
        trigger={<Button variant="secondary">Archive project</Button>}
        title="Archive Northwind launch?"
        description="People can still find it under Archived, and restore it there."
        confirmLabel="Archive project"
        error={error || undefined}
        onOpenChange={(open) => {
          if (!open) setError('');
        }}
        onConfirm={() => {
          setError('');
          return archive();
        }}
      />
      <Text role="status">{result}</Text>
    </Column>
  );
}
