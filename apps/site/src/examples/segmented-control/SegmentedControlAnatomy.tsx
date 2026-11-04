import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { IconViewList } from '@envsemble/envui/icons/ViewList';
import { IconViewModule } from '@envsemble/envui/icons/ViewModule';

export default function SegmentedControlAnatomy() {
  const [value, setValue] = useState('list');
  return (
    <SegmentedControl
      aria-label="Layout"
      size="lg"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'list', label: 'List', icon: <IconViewList />, count: 12 },
        { value: 'board', label: 'Board', icon: <IconViewModule />, count: 4 },
      ]}
    />
  );
}
