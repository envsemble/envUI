import { useState } from 'react';
import { SegmentedControl, Text } from '@envsemble/envui';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function SegmentedControlPreview() {
  const [view, setView] = useState('open');
  const [layout, setLayout] = useState('list');
  return (
    <Preview>
      <Example
        title="One choice among a few"
        size="collection"
        caption="Arrow keys move between options and choose them. Counts follow the label in a smaller, muted number."
      >
        <SpecimenGrid>
          <Specimen title="With counts">
            <SegmentedControl
              aria-label="Work items"
              value={view}
              onValueChange={setView}
              options={[
                { value: 'open', label: 'Open', count: 12 },
                { value: 'blocked', label: 'Blocked', count: 3 },
                { value: 'done', label: 'Done', count: 40 },
              ]}
            />
          </Specimen>
          <Specimen title="Compact with icons">
            <SegmentedControl
              aria-label="Layout"
              size="compact"
              value={layout}
              onValueChange={setLayout}
              options={[
                { value: 'list', label: 'List', icon: <ViewList /> },
                { value: 'board', label: 'Board', icon: <ViewModule /> },
                { value: 'timeline', label: 'Timeline', disabled: true },
              ]}
            />
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          Showing {view} items as a {layout}.
        </Text>
      </Example>
    </Preview>
  );
}
