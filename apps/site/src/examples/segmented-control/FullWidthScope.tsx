import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';

export default function FullWidthScope() {
  const [value, setValue] = useState('mine');
  return (
    <SegmentedControl
      aria-label="Tasks"
      value={value}
      onValueChange={setValue}
      items={[
        { value: 'mine', label: 'Assigned to me' },
        { value: 'team', label: 'Everyone on the team' },
      ]}
      fullWidth
    />
  );
}
