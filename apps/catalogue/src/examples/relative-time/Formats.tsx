import { useState } from 'react';
import { RelativeTime, Stack, Text } from '@envsemble/envui';

export default function Formats() {
  const [updatedAt] = useState(() => Date.now() - 3 * 60 * 60_000);
  return (
    <Stack gap={2}>
      <Text>
        Updated <RelativeTime value={updatedAt} />
      </Text>
      <Text>
        Updated <RelativeTime value={updatedAt} format="short" />
      </Text>
      <Text>
        Updated <RelativeTime value={updatedAt} format="narrow" />
      </Text>
    </Stack>
  );
}
