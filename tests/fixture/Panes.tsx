import { useState } from 'react';
import { Button, Panes, Text, type PanesSplitAt } from '@envsemble/envui';

const params = () => new URLSearchParams(location.search);

const projects = ['Northwind launch', 'Website refresh', 'Annual report'];

/**
 * Panes in a frame whose width the test sets, mounted with ?fixture=panes: supporting Panes with a
 * divider and a button that opens the supporting pane, and list-detail Panes whose list opens a
 * project. ?split= sets splitAt, ?persist= the cookie, ?size= the default size and ?dir=rtl
 * mirrors them.
 */
export function PanesFixture() {
  const query = params();
  const splitAt = (query.get('split') ?? undefined) as PanesSplitAt | undefined;
  const [width, setWidth] = useState(query.get('width') ?? '60rem');
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
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
      <div
        className="fixture-panes-frame"
        style={{ inlineSize: width }}
        data-testid="supporting-frame"
      >
        <Panes.Root
          behavior="supporting"
          splitAt={splitAt}
          open={open}
          onOpenChange={setOpen}
          persist={query.get('persist') ?? undefined}
          defaultSize={query.get('size') ? Number(query.get('size')) : undefined}
          onSizeChange={(size, { committed }) =>
            setSizes((current) => [...current, `${size}${committed ? '!' : ''}`])
          }
          name="document"
          data-testid="supporting"
        >
          <Panes.Main label="Document">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Show details
            </Button>
            <Text>The document, which scrolls on its own.</Text>
            <div style={{ blockSize: '40rem' }} />
          </Panes.Main>
          <Panes.Divider label="Resize details" />
          <Panes.Supporting label="Details">
            <Text>Owner: Ada</Text>
            <Button variant="secondary">Edit details</Button>
          </Panes.Supporting>
        </Panes.Root>
      </div>
      <output data-testid="sizes">{sizes.join(' ')}</output>
      <div className="fixture-panes-frame" style={{ inlineSize: width }} data-testid="list-frame">
        <Panes.Root
          behavior="list-detail"
          splitAt={splitAt}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          backLabel="All projects"
          data-testid="list-detail"
        >
          <Panes.List label="Projects">
            <ul aria-label="Projects">
              {projects.map((project) => (
                <li key={project}>
                  <button
                    type="button"
                    aria-current={chosen === project ? 'true' : undefined}
                    onClick={() => {
                      setChosen(project);
                      setDetailOpen(true);
                    }}
                  >
                    {project}
                  </button>
                </li>
              ))}
            </ul>
          </Panes.List>
          <Panes.Divider />
          <Panes.Detail label={chosen ?? 'No project'}>
            <Text>{chosen ? `About ${chosen}` : 'Choose a project.'}</Text>
          </Panes.Detail>
        </Panes.Root>
      </div>
    </div>
  );
}
