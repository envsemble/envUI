import { useState } from 'react';
import { AvatarButton, SearchTrigger, Column, Row, Text } from '@envsemble/envui';

export default function IconOnly() {
  const [searches, setSearches] = useState(0);
  return (
    <Column gap={3}>
      {/* A narrow header: the product's name at the start, its controls at the end. */}
      <Row align="center" justify="between" gap={2}>
        <Text variant="title" render={<span />}>
          Northwind
        </Text>
        <Row align="center" gap={1}>
          <SearchTrigger
            iconOnly
            listen={false}
            onClick={() => setSearches((count) => count + 1)}
          />
          <AvatarButton name="Alex Morgan" size="sm" />
        </Row>
      </Row>
      <Text variant="caption" emphasis="muted" role="status">
        {searches > 0 ? `Search opened ${searches} ${searches === 1 ? 'time' : 'times'}` : ''}
      </Text>
    </Column>
  );
}
