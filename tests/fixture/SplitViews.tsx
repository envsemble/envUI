import { useState } from 'react';
import { SplitView, Surface, Text, Theme, type ThemeValue } from '@envsemble/envui';

const documents = Array.from({ length: 30 }, (_, index) => `Quarterly report ${index + 1}`);

export function SplitViewFixture({ theme }: { theme: ThemeValue }) {
  const [changes, setChanges] = useState<number[]>([]);
  const [size, setSize] = useState(30);
  const [stackedChanges, setStackedChanges] = useState<boolean[]>([]);
  return (
    <Theme theme={theme} data-testid={`split-${theme}`} className="fixture-section">
      <div className="fixture-split-frame" data-testid={`split-frame-${theme}`}>
        <SplitView
          className="fixture-split-view"
          storageKey={`fixture-split-${theme}`}
          defaultSize={40}
          minSize={25}
          maxSize={75}
          stackBelow="40rem"
          resizeLabel={`Resize documents ${theme}`}
          onSizeChange={(next) => setChanges((list) => [...list, next])}
          onStackedChange={(stacked) => setStackedChanges((list) => [...list, stacked])}
          start={
            <ul className="fixture-split-list" aria-label={`Documents ${theme}`}>
              {documents.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          }
          end={
            <Surface tone="pane" padding={4}>
              <Text as="h3" variant="section-heading">
                Preview {theme}
              </Text>
              <Text>The design-system/tokens migration is behind schedule.</Text>
            </Surface>
          }
        />
      </div>
      <output data-testid={`split-changes-${theme}`}>{changes.join(' ')}</output>
      <output data-testid={`split-stacked-${theme}`}>{stackedChanges.join(' ')}</output>
      <SplitView
        size={size}
        onSizeChange={setSize}
        resizeLabel={`Resize controlled ${theme}`}
        start={<Text>Controlled start</Text>}
        end={<Text>Controlled end</Text>}
      />
      <output data-testid={`split-size-${theme}`}>{size}</output>
    </Theme>
  );
}
