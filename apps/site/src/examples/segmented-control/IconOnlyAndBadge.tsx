import { useState } from 'react';
import { Badge, Row, SegmentedControl } from '@envsemble/envui';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';

export default function IconOnlyAndBadge() {
  const [scope, setScope] = useState('open');
  const [layout, setLayout] = useState('list');
  return (
    <Row wrap align="center" gap={4}>
      <SegmentedControl
        aria-label="Work items"
        value={scope}
        onValueChange={setScope}
        items={[
          { value: 'open', label: 'Open', count: 12 },
          { value: 'review', label: 'In review', end: <Badge tone="accent">New</Badge> },
        ]}
      />
      <SegmentedControl
        aria-label="Layout"
        value={layout}
        onValueChange={setLayout}
        items={[
          { value: 'list', label: 'List', start: <IconViewList />, visibleLabel: false },
          { value: 'board', label: 'Board', start: <IconViewModule />, visibleLabel: false },
        ]}
      />
    </Row>
  );
}
