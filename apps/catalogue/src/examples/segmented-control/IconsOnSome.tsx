import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';

export default function IconsOnSome() {
  const [value, setValue] = useState('list');
  return (
    <SegmentedControl
      aria-label="Layout"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'list', label: 'List' },
        { value: 'board', label: 'Board', icon: <ViewModule /> },
        { value: 'timeline', label: 'Timeline' },
      ]}
    />
  );
}
