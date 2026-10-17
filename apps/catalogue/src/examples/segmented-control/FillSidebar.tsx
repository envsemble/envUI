import { useState } from 'react';
import { SegmentedControl } from '@envsemble/envui';

export default function FillSidebar() {
  const [scope, setScope] = useState('mine');
  return (
    // As narrow as a sidebar: too narrow for both labels side by side.
    <div style={{ inlineSize: '13rem' }}>
      <SegmentedControl
        fullWidth
        aria-label="Tasks"
        value={scope}
        onValueChange={setScope}
        items={[
          { value: 'mine', label: 'Assigned to me' },
          { value: 'team', label: 'Everyone on the team' },
        ]}
      />
    </div>
  );
}
