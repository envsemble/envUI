import { useState } from 'react';
import { Button, IconButton, Row } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

/** Work that takes a moment, such as saving; a timer stands in for it here. */
function useWork() {
  const [pending, setPending] = useState(false);
  const start = () => {
    setPending(true);
    window.setTimeout(() => setPending(false), 1800);
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
      <IconButton icon={<Refresh />} aria-label="Refresh" pending={refreshing} onClick={refresh} />
    </Row>
  );
}
