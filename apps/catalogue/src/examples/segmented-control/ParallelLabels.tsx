import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';

export default function ParallelLabels() {
  const [value, setValue] = useState('open');
  return (
    <SegmentedControl
      aria-label="Work items"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'open', label: 'Open' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'done', label: 'Done' },
      ]}
    />
  );
}
