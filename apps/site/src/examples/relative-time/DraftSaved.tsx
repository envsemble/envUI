import { useState } from 'react';
import { Button, RelativeTime, Column, Text } from '@envsemble/envui';

const minuteMs = 60_000;

export default function DraftSaved() {
  const [savedAt, setSavedAt] = useState(() => Date.now() - 20 * minuteMs);
  return (
    <Column gap={3} align="start">
      <Text>
        Draft saved <RelativeTime value={savedAt} />
      </Text>
      <Button variant="secondary" onClick={() => setSavedAt(Date.now())}>
        Save draft
      </Button>
    </Column>
  );
}
