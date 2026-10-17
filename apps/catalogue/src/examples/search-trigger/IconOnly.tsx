import { useState } from 'react';
import { AvatarButton, SearchTrigger, Stack, Text } from '@envsemble/envui';

export default function IconOnly() {
  const [searches, setSearches] = useState(0);
  return (
    <Stack gap={3}>
      {/* A narrow header: the product's name at the start, its controls at the end. */}
      <Stack direction="row" align="center" justify="between" gap={2}>
        <Text variant="title" render={<span />}>
          Northwind
        </Text>
        <Stack direction="row" align="center" gap={1}>
          <SearchTrigger
            iconOnly
            listen={false}
            onClick={() => setSearches((count) => count + 1)}
          />
          <AvatarButton name="Alex Morgan" size="sm" />
        </Stack>
      </Stack>
      <Text variant="caption" emphasis="muted" role="status">
        {searches > 0 ? `Search opened ${searches} ${searches === 1 ? 'time' : 'times'}` : ''}
      </Text>
    </Stack>
  );
}
