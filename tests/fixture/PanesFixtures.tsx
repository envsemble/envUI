import { useState } from 'react';
import { Button, List, Panes, Text, type PanesSplitAt } from '@envsemble/envui';

const params = () => new URLSearchParams(location.search);

const projects = ['Northwind launch', 'Website refresh', 'Annual report'];

/**
 * Panes in a frame whose width the test sets, mounted with ?fixture=panes: supporting Panes with a
 * divider and a button that opens the supporting pane, and list-detail Panes whose list opens a
 * project. ?split= sets splitAt, ?persist= the storage key and ?dir=rtl mirrors them.
 */
export function PanesFixture() {
  const query = params();
  const splitAt = (query.get('split') ?? undefined) as PanesSplitAt | undefined;
  const [width, setWidth] = useState(query.get('width') ?? '60rem');
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
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
      <div className="fixture-panes-frame" style={{ inlineSize: width }} data-testid="supporting-frame">
        <Panes.Root
          behavior="supporting"
          splitAt={splitAt}
          open={open}
          onOpenChange={setOpen}
          persist={query.get('persist') ?? undefined}
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
          open={chosen !== null}
          onOpenChange={(next) => !next && setChosen(null)}
          backLabel="All projects"
          data-testid="list-detail"
        >
          <Panes.List label="Projects">
            <List.Root aria-label="Projects">
              {projects.map((project) => (
                <List.Item
                  key={project}
                  current={chosen === project}
                  onClick={() => setChosen(project)}
                >
                  {project}
                </List.Item>
              ))}
            </List.Root>
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
