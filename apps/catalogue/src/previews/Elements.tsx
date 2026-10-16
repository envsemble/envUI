import { useState } from 'react';
import {
  ActionGroup,
  Badge,
  Breadcrumbs,
  Button,
  CounterBadge,
  DiffStat,
  HoverCard,
  IconButton,
  Kbd,
  Link,
  NavList,
  Alert,
  Stack,
  Surface,
  Text,
} from '@envsemble/envui';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

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
                Approved
              </Badge>
              <Badge tone="done" icon={<TaskAlt />}>
                Done
              </Badge>
              <Badge icon={<Folder />}>Shared drafts</Badge>
            </ActionGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Counters" size="collection">
        <SpecimenGrid>
          <Specimen title="Neutral and accent">
            <ActionGroup>
              <CounterBadge value={3} />
              <CounterBadge value={128} />
              <CounterBadge value="99+" tone="accent" aria-label="More than 99 unread" />
            </ActionGroup>
          </Specimen>
          <Specimen title="Diff counts">
            <ActionGroup>
              <DiffStat additions={124} deletions={37} />
              <Button variant="secondary">
                Diffs <DiffStat additions={12} deletions={3} />
              </Button>
            </ActionGroup>
          </Specimen>
          <Specimen title="In navigation">
            <Stack gap={1}>
              <NavList.Item
                icon={<Inbox />}
                selected={selected === 'inbox'}
                onClick={() => setSelected('inbox')}
                trailing={<CounterBadge value={12} aria-label="12 unread" tone="accent" />}
              >
                Inbox
              </NavList.Item>
              <NavList.Item
                icon={<Description />}
                selected={selected === 'plans'}
                onClick={() => setSelected('plans')}
                trailing={<CounterBadge value={4} />}
              >
                Plans
              </NavList.Item>
              <NavList.Item
                icon={<Inbox />}
                iconOnly
                aria-label="Inbox, 12 unread"
                selected={selected === 'compact'}
                onClick={() => setSelected('compact')}
                trailing={<CounterBadge value={12} />}
              >
                Inbox
              </NavList.Item>
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

export function AlertsPreview() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <Preview>
      <Example title="Tones" size="wide">
        <Stack gap={3}>
          <Alert title="Sync paused">Changes are saved on this device until you reconnect.</Alert>
          <Alert tone="success">The plan was published to the team.</Alert>
          <Alert
            tone="warning"
            title="Two decisions are blocked"
            action={
              <Button variant="secondary" onClick={() => undefined}>
                Review blockers
              </Button>
            }
          >
            The release cannot start until both are resolved.
          </Alert>
          {dismissed ? (
            <Button variant="secondary" onClick={() => setDismissed(false)}>
              Show the error again
            </Button>
          ) : (
            <Alert tone="error" title="Search is unavailable" onDismiss={() => setDismissed(true)}>
              The search service did not respond. Your open documents are still here.
            </Alert>
          )}
        </Stack>
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

export function BreadcrumbsPreview() {
  const [level, setLevel] = useState('Roadmap.md');
  return (
    <Preview>
      <Example
        title="Where you are"
        size="collection"
        caption="Earlier levels are links or buttons; the current page is last and not a link."
      >
        <Breadcrumbs
          items={[
            { label: 'Workspace', href: '#/workspace' },
            { label: 'Plans', onClick: () => setLevel('Plans') },
            { label: 'Search', onClick: () => setLevel('Search') },
            { label: 'Roadmap.md' },
          ]}
        />
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {level === 'Roadmap.md' ? '' : `Went to ${level}`}
        </Text>
      </Example>
      <Example
        title="On one line"
        size="field"
        caption="With wrap set to false, the trail stays on one line in a bar or header: the current page is cut short first, and earlier levels keep their width."
      >
        <Surface
          tone="row"
          padding={2}
          corners="standard"
          density="compact"
          className="docs-breadcrumb-bar"
        >
          <Breadcrumbs
            aria-label="Document location"
            wrap={false}
            items={[
              { label: 'Plans', href: '#/plans' },
              { label: 'Quarterly review of the shared design tokens' },
            ]}
          />
          <Badge tone="success">Published</Badge>
          <IconButton variant="text" icon={<MoreVert />} aria-label="More actions" />
        </Surface>
      </Example>
    </Preview>
  );
}

export function KbdPreview() {
  return (
    <Preview>
      <Example title="Keys and shortcuts" size="collection">
        <Stack gap={3}>
          <Text>
            Press <Kbd keys={['Ctrl', 'P']} /> to open a document, or <Kbd>F2</Kbd> to rename it.
          </Text>
          <Text>
            Close the current tab with <Kbd keys={['Ctrl', 'W']} />, or every tab with{' '}
            <Kbd keys={['Ctrl', 'K', 'W']} />.
          </Text>
        </Stack>
      </Example>
    </Preview>
  );
}
