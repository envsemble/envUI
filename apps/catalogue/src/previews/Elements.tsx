import { useState } from 'react';
import {
  ActionGroup,
  Badge,
  Button,
  Counter,
  Input,
  NavigationItem,
  Notice,
  Popover,
  SegmentedControl,
  Stack,
  Text,
} from '@envsemble/envui';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Description } from '@envsemble/envui/icons/Description';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Info } from '@envsemble/envui/icons/Info';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
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

const badgeTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'] as const;
const badgeLabels: Record<(typeof badgeTones)[number], string> = {
  neutral: 'Archived',
  accent: 'In review',
  success: 'Ready',
  warning: 'Blocked',
  danger: 'Failed',
  done: 'Completed',
};

export function BadgesPreview() {
  const [selected, setSelected] = useState('inbox');
  return (
    <Preview>
      <Example title="Badges" size="collection">
        <SpecimenGrid size="wide">
          {(['subtle', 'solid', 'outline'] as const).map((variant) => (
            <Specimen key={variant} title={variant[0]!.toUpperCase() + variant.slice(1)}>
              <ActionGroup>
                {badgeTones.map((tone) => (
                  <Badge key={tone} tone={tone} variant={variant}>
                    {badgeLabels[tone]}
                  </Badge>
                ))}
              </ActionGroup>
            </Specimen>
          ))}
          <Specimen title="With an icon">
            <ActionGroup>
              <Badge tone="success" icon={<CheckCircle />}>
                Merged
              </Badge>
              <Badge tone="done" icon={<TaskAlt />}>
                Done
              </Badge>
              <Badge icon={<Folder />}>envsemble/atlas</Badge>
            </ActionGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Counters" size="collection">
        <SpecimenGrid>
          <Specimen title="Neutral and accent">
            <ActionGroup>
              <Counter value={3} />
              <Counter value={128} />
              <Counter value="99+" tone="accent" aria-label="More than 99 unread" />
            </ActionGroup>
          </Specimen>
          <Specimen title="In navigation">
            <Stack gap={1}>
              <NavigationItem
                icon={<Inbox />}
                selected={selected === 'inbox'}
                onClick={() => setSelected('inbox')}
                trailing={<Counter value={12} aria-label="12 unread" tone="accent" />}
              >
                Inbox
              </NavigationItem>
              <NavigationItem
                icon={<Description />}
                selected={selected === 'plans'}
                onClick={() => setSelected('plans')}
                trailing={<Counter value={4} />}
              >
                Plans
              </NavigationItem>
              <NavigationItem
                icon={<Inbox />}
                iconOnly
                aria-label="Inbox, 12 unread"
                selected={selected === 'compact'}
                onClick={() => setSelected('compact')}
                trailing={<Counter value={12} />}
              >
                Inbox
              </NavigationItem>
            </Stack>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Tone colors"
        size="collection"
        caption="Status icons and short text use the tone tokens directly; each keeps 4.5:1 on the canvas and panes in both themes."
      >
        <ActionGroup>
          {badgeTones.map((tone) => (
            <span
              key={tone}
              className="docs-tone-sample"
              style={{ color: `var(--color-tone-${tone})` }}
            >
              <CheckCircle /> {tone}
            </span>
          ))}
        </ActionGroup>
      </Example>
    </Preview>
  );
}

export function NoticesPreview() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <Preview>
      <Example title="Tones" size="wide">
        <Stack gap={3}>
          <Notice title="Sync paused">Changes are saved on this device until you reconnect.</Notice>
          <Notice tone="success">The plan was published to the team.</Notice>
          <Notice
            tone="warning"
            title="Two decisions are blocked"
            action={
              <Button variant="secondary" onClick={() => undefined}>
                Review blockers
              </Button>
            }
          >
            The release cannot start until both are resolved.
          </Notice>
          {dismissed ? (
            <Button variant="secondary" onClick={() => setDismissed(false)}>
              Show the error again
            </Button>
          ) : (
            <Notice
              tone="error"
              title="The index could not load"
              onDismiss={() => setDismissed(true)}
            >
              The planning repository is unavailable. Your open documents are still here.
            </Notice>
          )}
        </Stack>
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
        caption="Escape or a press outside closes the popover and focus returns to its trigger."
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
                  <Input label="Name" name="name" defaultValue={name} />
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
