import { useState } from 'react';
import { Button, SegmentedControl, Column, Row, Surface } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';
import { IconViewTimeline } from '@envsemble/envui/icons/ViewTimeline';

export default function SmallToolbar() {
  const [layout, setLayout] = useState('list');
  return (
    // The toolbar is as wide as its controls.
    <Column gap={4} align="start">
      <Surface
        background="default"
        padding={1}
        radius="full"
        role="group"
        aria-label="Projects"
        render={<Row wrap align="center" gap={4} />}
      >
        <SegmentedControl
          aria-label="Layout"
          size="sm"
          value={layout}
          onValueChange={setLayout}
          items={[
            { value: 'list', label: 'List', icon: <IconViewList /> },
            { value: 'board', label: 'Board', icon: <IconViewModule /> },
            // Not available yet for this workspace.
            { value: 'timeline', label: 'Timeline', icon: <IconViewTimeline />, disabled: true },
          ]}
        />
        <Button variant="secondary" size="sm" startIcon={<IconAdd />}>
          New project
        </Button>
      </Surface>
    </Column>
  );
}
