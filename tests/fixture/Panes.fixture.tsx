import { useState } from 'react';
import { Button, Panes, Surface, Text } from '@envsemble/envui';

export const mount = 'standalone';

const params = () => new URLSearchParams(location.search);

export default function PanesFixture() {
  const query = params();
  const sized = (query.get('sized') ?? undefined) as 'start' | 'end' | undefined;
  const stackBelow = (query.get('stack') ?? undefined) as Panes.StackBelow | undefined;
  const handle = query.get('handle') !== 'none';
  const only = query.get('only');
  const [width, setWidth] = useState(query.get('width') ?? '60rem');
  const [sizes, setSizes] = useState<string[]>([]);
  return (
    <div dir={query.get('dir') ?? undefined} className="fixture-section">
      <div className="fixture-actions">
        {['30rem', '45rem', '60rem', '80rem'].map((value) => (
          <button key={value} type="button" onClick={() => setWidth(value)}>
            Width {value}
          </button>
        ))}
      </div>
      <div className="fixture-panes-frame" style={{ inlineSize: width }} data-testid="frame">
        <Panes.Root
          sized={sized}
          stackBelow={stackBelow}
          defaultWidth={query.get('size') ? Number(query.get('size')) : undefined}
          onWidthChange={(size, { committed }) =>
            setSizes((current) => [...current, `${size}${committed ? '!' : ''}`])
          }
          name="inbox"
          data-testid="panes"
        >
          {only !== 'detail' && (
            <Panes.Pane label="Projects" header={<Text data-testid="list-header">Projects</Text>}>
              <Text>Northwind launch</Text>
              <Button variant="secondary">New project</Button>
              <div style={{ blockSize: '40rem' }} />
            </Panes.Pane>
          )}
          {handle && (
            <Panes.ResizeHandle
              label="Resize projects"
              grip={query.get('grip') !== 'off'}
              disabled={query.has('disabled')}
            />
          )}
          {only !== 'list' && (
            <Panes.Pane label="Northwind launch">
              <Surface padding={4} data-testid="detail-surface" style={{ minBlockSize: '100%' }}>
                <Text>About Northwind launch</Text>
              </Surface>
            </Panes.Pane>
          )}
        </Panes.Root>
      </div>
      <output data-testid="sizes">{sizes.join(' ')}</output>
    </div>
  );
}
