import { useState } from 'react';
import { Button, EnvUIProvider, ListDetail, SplitPane, Stack, Text } from '@envsemble/envui';

const projects = ['Northwind launch', 'Annual report', 'Office move', 'Hiring plan'];

/** A size readout beside a split pane, with whether the last change was committed. */
function useSizeLog() {
  const [log, setLog] = useState('');
  return {
    log,
    onSizeChange: (size: number, { committed }: { committed: boolean }) =>
      setLog(`${size}${committed ? ' committed' : ''}`),
  };
}

/** Two panes with text in each, in a box of its own height. */
function Panes({ name }: { name: string }) {
  return (
    <>
      <SplitPane.Pane label={`${name} list`}>
        <p>{name} list pane</p>
      </SplitPane.Pane>
      <SplitPane.ResizeHandle label={`Resize ${name}`} />
      <SplitPane.Pane label={`${name} detail`}>
        <p>{name} detail pane</p>
      </SplitPane.Pane>
    </>
  );
}

/**
 * Split panes for the resize, persistence, direction and stacking checks: a persisted horizontal
 * one, a vertical one, one in rem, one in right-to-left text, one whose container's width the test
 * changes, and a list beside its detail.
 */
export function SplitPanesFixture() {
  const persisted = useSizeLog();
  const vertical = useSizeLog();
  const rem = useSizeLog();
  const rtl = useSizeLog();
  const [width, setWidth] = useState('40rem');
  const [stacked, setStacked] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [detailShown, setDetailShown] = useState(false);
  const [listWidth, setListWidth] = useState('60rem');
  return (
    <Stack gap={5} className="fixture-section">
      <section aria-label="Persisted">
        <SplitPane.Root
          data-testid="persisted"
          persist="fixture.split"
          defaultSize={40}
          onSizeChange={persisted.onSizeChange}
          style={{ inlineSize: '600px', blockSize: '8rem' }}
        >
          <Panes name="Persisted" />
        </SplitPane.Root>
        <output data-testid="persisted-size">{persisted.log}</output>
      </section>
      <section aria-label="Vertical">
        <SplitPane.Root
          data-testid="vertical"
          orientation="vertical"
          onSizeChange={vertical.onSizeChange}
          style={{ inlineSize: '20rem', blockSize: '400px' }}
        >
          <Panes name="Vertical" />
        </SplitPane.Root>
        <output data-testid="vertical-size">{vertical.log}</output>
      </section>
      <section aria-label="Rem">
        <SplitPane.Root
          data-testid="rem"
          unit="rem"
          defaultSize={12}
          minSize={8}
          maxSize={20}
          onSizeChange={rem.onSizeChange}
          style={{ inlineSize: '640px', blockSize: '6rem' }}
        >
          <Panes name="Rem" />
        </SplitPane.Root>
        <output data-testid="rem-size">{rem.log}</output>
      </section>
      <EnvUIProvider dir="rtl">
        <section aria-label="Right to left" dir="rtl">
          <SplitPane.Root
            data-testid="rtl"
            onSizeChange={rtl.onSizeChange}
            style={{ inlineSize: '600px', blockSize: '6rem' }}
          >
            <Panes name="Right to left" />
          </SplitPane.Root>
          <output data-testid="rtl-size">{rtl.log}</output>
        </section>
      </EnvUIProvider>
      <section aria-label="Stacking">
        <Stack direction="row" gap={2}>
          <Button variant="secondary" onClick={() => setWidth('40rem')}>
            Wide container
          </Button>
          <Button variant="secondary" onClick={() => setWidth('20rem')}>
            Narrow container
          </Button>
        </Stack>
        <div style={{ inlineSize: width }}>
          <SplitPane.Root data-testid="stacking" stackBelow="30rem" onStackedChange={setStacked}>
            <Panes name="Stacking" />
          </SplitPane.Root>
        </div>
        <output data-testid="stacked">{stacked ? 'stacked' : 'side by side'}</output>
      </section>
      <section aria-label="List and detail">
        <Stack direction="row" gap={2}>
          <Button variant="secondary" onClick={() => setListWidth('60rem')}>
            Wide list and detail
          </Button>
          <Button variant="secondary" onClick={() => setListWidth('24rem')}>
            Narrow list and detail
          </Button>
        </Stack>
        <div style={{ inlineSize: listWidth }}>
          <ListDetail.Root
            data-testid="list-detail"
            detailShown={detailShown}
            onBack={() => setDetailShown(false)}
            backLabel="All projects"
            style={{ blockSize: '16rem' }}
          >
            <ListDetail.List label="Projects">
              <ul>
                {projects.map((project) => (
                  <li key={project}>
                    <button
                      type="button"
                      aria-current={chosen === project || undefined}
                      onClick={() => {
                        setChosen(project);
                        setDetailShown(true);
                      }}
                    >
                      {project}
                    </button>
                  </li>
                ))}
              </ul>
            </ListDetail.List>
            <ListDetail.Detail label={chosen ?? 'No project'}>
              <Text>{chosen ? `${chosen} details` : 'Choose a project'}</Text>
            </ListDetail.Detail>
          </ListDetail.Root>
        </div>
      </section>
    </Stack>
  );
}
