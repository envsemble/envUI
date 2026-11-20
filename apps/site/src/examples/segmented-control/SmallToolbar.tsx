import { useState } from 'react';
import { Button, SegmentedControl, Column, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import { IconViewTimeline } from '@envsemble/envui/icons/ViewTimeline';

export default function SmallToolbar() {
  const [layout, setLayout] = useState('list');
  return (
    <Column gap={4} align="start">
      <Row wrap align="center" gap={4} role="group" aria-label="Projects">
        <SegmentedControl
          aria-label="Layout"
          size="sm"
          value={layout}
          onValueChange={setLayout}
          items={[
            { value: 'list', label: 'List', start: <IconViewList /> },
            { value: 'board', label: 'Board', start: <IconViewModule /> },
            { value: 'timeline', label: 'Timeline', start: <IconViewTimeline />, disabled: true },
          ]}
        />
        <Button variant="secondary" size="sm" start={<IconAdd />}>
          New project
        </Button>
      </Row>
    </Column>
  );
}
