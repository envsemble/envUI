import { useState } from 'react';
import { Button, RelativeTime, Stack, Text } from '@envsemble/envui';

export default function DraftSaved() {
  // The draft was last saved 20 minutes before the page opened.
  const [savedAt, setSavedAt] = useState(() => Date.now() - 20 * 60_000);
  return (
    <Stack gap={3} align="start">
      <Text>
        Draft saved <RelativeTime value={savedAt} />
      </Text>
      <Button variant="secondary" onClick={() => setSavedAt(Date.now())}>
        Save draft
      </Button>
    </Stack>
  );
}
