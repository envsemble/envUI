import { useState } from 'react';
import {
  ActionGroup,
  Button,
  HoverCard,
  TextField,
  Kbd,
  Link,
  Popover,
  SegmentedControl,
  Stack,
  Text,
} from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Info } from '@envsemble/envui/icons/Info';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function SegmentedControlPreview() {
  const [view, setView] = useState('open');
  const [layout, setLayout] = useState('list');
  const [assigned, setAssigned] = useState('mine');
  return (
    <Preview>
      <Example
        title="One choice among a few"
        size="collection"
        caption={
          <>
            <Kbd>←</Kbd> and <Kbd>→</Kbd> move between options and choose them. Counts follow the
            label in a smaller, muted number.
          </>
        }
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
          <Specimen title="Full width in a narrow sidebar">
            <div className="docs-narrow-segments">
              <SegmentedControl
                fullWidth
                aria-label="Assignments"
                value={assigned}
                onValueChange={setAssigned}
                options={[
                  { value: 'mine', label: 'Assigned to me' },
                  { value: 'team', label: 'Everyone on the team' },
                ]}
              />
            </div>
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          Showing {view} items as a {layout}.
        </Text>
      </Example>
    </Preview>
  );
}

export function PopoverPreview() {
  const [name, setName] = useState('Roadmap.md');
  return (
    <Preview>
      <Example
        title="Popovers"
        size="collection"
        caption={
          <>
            <Kbd>Esc</Kbd> or a press outside closes the popover and focus returns to its trigger.
          </>
        }
      >
        <ActionGroup>
          <Popover
            title="Roadmap.md"
            trigger={
              <Button variant="secondary" startIcon={<Info />}>
                Details
              </Button>
            }
          >
            <Text tone="muted">Changed today by Alex. 3 open decisions, 1 blocked.</Text>
          </Popover>
          <Popover
            aria-label="Rename document"
            width="wide"
            trigger={
              <Button variant="secondary" startIcon={<Edit />}>
                Rename
              </Button>
            }
          >
            {(close) => (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setName(String(new FormData(event.currentTarget).get('name')));
                  close();
                }}
              >
                <Stack gap={3}>
                  <TextField label="Name" name="name" defaultValue={name} />
                  <ActionGroup align="end">
                    <Button variant="secondary" onClick={close}>
                      Cancel
                    </Button>
                    <Button type="submit">Rename</Button>
                  </ActionGroup>
                </Stack>
              </form>
            )}
          </Popover>
        </ActionGroup>
        <Text variant="caption" className="docs-caption">
          Current name: {name}
        </Text>
      </Example>
    </Preview>
  );
}

export function HoverCardPreview() {
  return (
    <Preview>
      <Example
        title="Hover cards"
        size="collection"
        caption={
          <>
            Rest the pointer on a link or focus it with the keyboard. <Kbd>Esc</Kbd> closes the
            card; focus stays on the link.
          </>
        }
      >
        <Text>
          The release depends on{' '}
          <HoverCard trigger={<Link href="#roadmap">Roadmap.md</Link>}>
            <Stack gap={2}>
              <Text>
                <strong>Roadmap.md</strong>
              </Text>
              <Text tone="muted">Changed today by Alex. 3 open decisions, 1 blocked.</Text>
            </Stack>
          </HoverCard>{' '}
          and on{' '}
          <HoverCard width="wide" side="top" trigger={<Link href="#sync">Sync conflicts</Link>}>
            <Stack gap={2}>
              <Text>
                <strong>Sync conflicts</strong>
              </Text>
              <Text tone="muted">
                Owned by Sam Lee in Plans/Sync. Two edits made offline on the same paragraph wait
                for a decision about which one to keep.
              </Text>
            </Stack>
          </HoverCard>
          .
        </Text>
      </Example>
    </Preview>
  );
}
