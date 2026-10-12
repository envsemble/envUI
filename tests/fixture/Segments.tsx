import { useState } from 'react';
import { SegmentedControl, Theme, type ThemeValue } from '@envsemble/envui';
import { ViewList } from '@envsemble/envui/icons/ViewList';

export function SegmentedControlFixture({ theme }: { theme: ThemeValue }) {
  const [view, setView] = useState('open');
  const [layout, setLayout] = useState('list');
  return (
    <Theme theme={theme} data-testid={`segments-${theme}`} className="fixture-section">
      <SegmentedControl
        aria-label={`Work items ${theme}`}
        value={view}
        onValueChange={setView}
        options={[
          { value: 'open', label: 'Open', count: 12 },
          { value: 'blocked', label: 'Blocked', count: 3 },
          { value: 'archived', label: 'Archived', disabled: true },
          { value: 'done', label: 'Done', count: 40 },
        ]}
      />
      <SegmentedControl
        aria-label={`Layout ${theme}`}
        size="compact"
        value={layout}
        onValueChange={setLayout}
        options={[
          { value: 'list', label: 'List', icon: <ViewList /> },
          { value: 'board', label: 'Board' },
        ]}
      />
      <output data-testid={`segments-value-${theme}`}>
        {view} {layout}
      </output>
    </Theme>
  );
}
