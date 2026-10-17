import { useState } from 'react';
import { EnvUIProvider, SegmentedControl, Theme, type ThemeValue } from '@envsemble/envui';
import { ViewList } from '@envsemble/envui/icons/ViewList';

export function SegmentedControlFixture({ theme }: { theme: ThemeValue }) {
  const [view, setView] = useState('open');
  const [layout, setLayout] = useState('list');
  const [assigned, setAssigned] = useState('mine');
  return (
    <Theme theme={theme} data-testid={`segments-${theme}`} className="fixture-section">
      <SegmentedControl
        aria-label={`Work items ${theme}`}
        data-testid={`segments-rail-${theme}`}
        value={view}
        onValueChange={setView}
        items={[
          { value: 'open', label: 'Open', count: 12 },
          { value: 'blocked', label: 'Blocked', count: 3 },
          { value: 'archived', label: 'Archived', disabled: true },
          { value: 'done', label: 'Done', count: 40 },
        ]}
      />
      <SegmentedControl
        aria-label={`Layout ${theme}`}
        size="sm"
        value={layout}
        onValueChange={setLayout}
        items={[
          { value: 'list', label: 'List', icon: <ViewList /> },
          { value: 'board', label: 'Board' },
        ]}
      />
      {/* Two long labels in a container too narrow for them side by side. */}
      <EnvUIProvider locale="de-DE">
        <SegmentedControl
          aria-label={`Counts in German ${theme}`}
          value="all"
          onValueChange={() => {}}
          items={[{ value: 'all', label: 'Alle', count: 1200 }]}
        />
      </EnvUIProvider>
      <div className="fixture-segments-narrow" data-testid={`segments-narrow-${theme}`}>
        <SegmentedControl
          fullWidth
          aria-label={`Assignments ${theme}`}
          value={assigned}
          onValueChange={setAssigned}
          items={[
            { value: 'mine', label: 'Assigned to me' },
            { value: 'team', label: 'Everyone on the team' },
          ]}
        />
      </div>
      <div className="fixture-segments-wide" data-testid={`segments-wide-${theme}`}>
        <SegmentedControl
          fullWidth
          aria-label={`Scopes ${theme}`}
          value={assigned}
          onValueChange={setAssigned}
          items={[
            { value: 'mine', label: 'Mine', count: 4 },
            { value: 'team', label: 'Team', count: 12 },
            { value: 'all', label: 'All' },
          ]}
        />
      </div>
      <output data-testid={`segments-value-${theme}`}>
        {view} {layout}
      </output>
    </Theme>
  );
}
