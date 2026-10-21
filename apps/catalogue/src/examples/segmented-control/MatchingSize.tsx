import { useState } from 'react';
import { Button, Row, SegmentedControl } from '@envsemble/envui';

export default function MatchingSize() {
  const [value, setValue] = useState('list');
  return (
    <Row wrap align="center" gap={3}>
      <SegmentedControl
        aria-label="Layout"
        size="sm"
        value={value}
        onValueChange={setValue}
        items={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
        ]}
      />
      <Button size="sm" variant="secondary">
        New project
      </Button>
    </Row>
  );
}
