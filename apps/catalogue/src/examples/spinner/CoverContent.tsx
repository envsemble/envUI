import { useState } from 'react';
import { Column, SegmentedControl, Spinner } from '@envsemble/envui';

const views = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

export default function CoverContent() {
  const [view, setView] = useState('done');
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <SegmentedControl
        aria-label="Show tasks"
        items={views}
        value={view}
        onValueChange={setView}
      />
      {/* Wrong: the tasks people were reading are gone while the list updates. */}
      <Column align="center" justify="center" style={{ minBlockSize: '8rem' }}>
        <Spinner size="lg" label="Updating tasks" />
      </Column>
    </Column>
  );
}
