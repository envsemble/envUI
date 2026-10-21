import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Column, Row } from '@envsemble/envui';

export default function SaveFailed() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'failed'>('idle');
  const saveButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const save = () => {
    setStatus('saving');
    // Stands in for a request that fails.
    timer.current = window.setTimeout(() => setStatus('failed'), 800);
  };
  const dismiss = () => {
    setStatus('idle');
    // The dismiss button goes with the alert, so focus moves to the action it concerns.
    saveButton.current?.focus();
  };

  return (
    <Column gap={3}>
      {status === 'failed' && (
        <Alert tone="danger" title="Couldn’t save the draft" announce onDismiss={dismiss}>
          The connection dropped while saving. Your changes are still in the editor; try again in a
          moment.
        </Alert>
      )}
      <Row wrap align="center" gap={4}>
        <Button ref={saveButton} pending={status === 'saving'} onClick={save}>
          Save draft
        </Button>
      </Row>
    </Column>
  );
}
