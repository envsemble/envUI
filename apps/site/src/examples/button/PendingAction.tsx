import { useState } from 'react';
import { Button, IconButton, Row } from '@envsemble/envui';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';

const simulatedWorkMs = 1800;

function useWork() {
  const [pending, setPending] = useState(false);
  const start = () => {
    setPending(true);
    window.setTimeout(() => setPending(false), simulatedWorkMs);
  };
  return [pending, start] as const;
}

export default function PendingAction() {
  const [saving, save] = useWork();
  const [refreshing, refresh] = useWork();
  return (
    <Row wrap align="center" gap={4}>
      <Button pending={saving} onClick={save}>
        Save changes
      </Button>
      <IconButton
        icon={<IconRefresh />}
        aria-label="Refresh"
        pending={refreshing}
        onClick={refresh}
      />
    </Row>
  );
}
