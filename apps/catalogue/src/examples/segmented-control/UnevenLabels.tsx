import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';

export default function UnevenLabels() {
  const [value, setValue] = useState('open');
  return (
    <SegmentedControl
      aria-label="Work items"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'open', label: 'Open' },
        { value: 'blocked', label: 'Waiting on another team' },
        { value: 'done', label: 'Done' },
      ]}
    />
  );
}
