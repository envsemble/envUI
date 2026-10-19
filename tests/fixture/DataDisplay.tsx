import { useState } from 'react';
import {
  Badge,
  Breadcrumbs,
  List,
  IconButton,
  Kbd,
  Link,
  LinkProvider,
  Surface,
  Table,
  Text,
  Theme,
  type LinkComponentProps,
  type ThemeValue,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

/** A trail too long for its narrow frame: the current page cannot fit beside the earlier levels. */
const narrowTrail = [
  { label: 'Workspace', href: '/workspace' },
  { label: 'Plans', href: '/workspace/plans' },
  { label: 'Quarterly review of the shared design tokens' },
];

const plans = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  title: `Plan ${index + 1}`,
  owner: index % 2 ? 'Alex Morgan' : 'Sam Lee',
  decisions: (index * 7) % 23,
  status: index % 3 === 0 ? 'Blocked' : 'In progress',
}));

function RecordingLink({ href, onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        document.body.dataset.breadcrumbNavigatedTo = href;
      }}
    />
  );
}

export function DataDisplayFixture({ theme }: { theme: ThemeValue }) {
  const [crumb, setCrumb] = useState('');
  const [rowResult, setRowResult] = useState('');
  return (
    <Theme theme={theme} data-testid={`data-${theme}`} className="fixture-section">
      <LinkProvider component={RecordingLink}>
        <Breadcrumbs
          items={[
            { label: 'Workspace', href: '/workspace' },
            { label: 'Plans', onClick: () => setCrumb('Plans') },
            { label: 'Search' },
            { label: 'Roadmap.md' },
          ]}
        />
        <div className="fixture-breadcrumb-frame">
          <Breadcrumbs aria-label="Wrapping trail" items={narrowTrail} />
        </div>
        <div className="fixture-breadcrumb-frame">
          <Breadcrumbs aria-label="One-line trail" wrap={false} items={narrowTrail} />
        </div>
        <div className="fixture-breadcrumb-frame" dir="rtl">
          <Breadcrumbs aria-label="Right-to-left trail" wrap={false} items={narrowTrail} />
        </div>
        {/* A level whose name runs past the 20 rem a level takes. */}
        <Breadcrumbs
          aria-label="Long level trail"
          items={[
            { label: 'Workspace', href: '/workspace' },
            {
              label: 'A folder whose name runs well past the room that one level of a trail takes',
              href: '/workspace/folder',
            },
            { label: 'Notes' },
          ]}
        />
        {/* A small header bar as wide as a phone: the trail beside a status and an action. */}
        <Surface
          background="muted"
          padding={2}
          radius="sm"
          className="fixture-breadcrumb-bar"
          data-testid={`breadcrumb-bar-${theme}`}
        >
          <Breadcrumbs
            aria-label="Header trail"
            wrap={false}
            items={[
              { label: 'Plans', href: '/workspace/plans' },
              { label: 'Quarterly review of the shared design tokens' },
            ]}
          />
          <Badge tone="success">Published</Badge>
          <IconButton size="sm" icon={<MoreVert />} aria-label="More actions" />
        </Surface>
      </LinkProvider>
      <output data-testid={`breadcrumb-result-${theme}`}>{crumb}</output>
      <p>
        Open with <Kbd keys={['Ctrl', 'P']} /> or press <Kbd>F2</Kbd>.
      </p>
      <div className="fixture-table-frame">
        <Table.Root caption={`Plans ${theme}`} stickyHeader regionClassName="fixture-table-region">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Plan</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.HeaderCell numeric>Decisions</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell nowrap>A long trailing column heading</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {plans.map((plan) => (
              <Table.Row key={plan.id} interactive>
                <Table.Cell>
                  {plan.title}
                  <Text variant="caption">Updated today</Text>
                </Table.Cell>
                <Table.Cell nowrap>{plan.owner}</Table.Cell>
                <Table.Cell numeric>{plan.decisions}</Table.Cell>
                <Table.Cell>
                  <Badge tone={plan.status === 'Blocked' ? 'warning' : 'accent'}>
                    {plan.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell nowrap>
                  Some wide content that makes the table scroll sideways
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
      <List.Root aria-label={`Rows ${theme}`}>
        <List.Item
          interactive
          className="fixture-open-row"
          label={
            <span className="fixture-row-title">
              <Description />
              <Link
                href="#roadmap"
                underline={false}
                data-row-target
                draggable={false}
                onClick={(event) => {
                  event.preventDefault();
                  setRowResult('open roadmap');
                }}
              >
                Roadmap
              </Link>
            </span>
          }
          description="Updated today"
          action={
            <IconButton
              variant="text"
              icon={<MoreHoriz />}
              aria-label="More actions"
              className="fixture-row-action"
              onClick={() => setRowResult('more actions')}
            />
          }
        />
        <List.Item label="Archive" description="Read only" />
      </List.Root>
      <output data-testid={`row-result-${theme}`}>{rowResult}</output>
      <Table.Root aria-label={`Compact ${theme}`} density="sm">
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell scope="row">Total</Table.HeaderCell>
            <Table.Cell numeric>1,204</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Theme>
  );
}
