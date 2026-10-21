import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { ViewTimeline } from '@envsemble/envui/icons/ViewTimeline';

export default function IconsOnAll() {
  const [value, setValue] = useState('list');
  return (
    <SegmentedControl
      aria-label="Layout"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'list', label: 'List', icon: <ViewList /> },
        { value: 'board', label: 'Board', icon: <ViewModule /> },
        { value: 'timeline', label: 'Timeline', icon: <ViewTimeline /> },
      ]}
    />
  );
}
